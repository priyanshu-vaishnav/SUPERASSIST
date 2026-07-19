const graph = require("../graph/graph");
const { supabaseAdmin } = require('../config/supabase'); // Removed unused supabase
const redis = require("../../shared/redis");

// Constants
const TOKEN_LIMIT = 55000;
const MAX_MEMORY_MESSAGES = 100; // Prevent Redis OOM
const MEMORY_WINDOW = 50; // Last N messages sent to agent
const REDIS_TTL = 3600 * 24; // 24 hours
const MAX_INPUT_LENGTH = 10000; // Prevent DoS

const chatController = async (req, res) => {
    const userId = req.userId;
    let { chatId, humanMessage } = req.body;

    try {
        // ✅ FIX 1: Validate humanMessage FIRST (before any side effects)
        if (!humanMessage || typeof humanMessage !== 'string' || !humanMessage.trim()) {
            return res.status(400).json({
                success: false,
                message: "bad request: humanMessage is required"
            });
        }

        // ✅ FIX 14: Input length validation (DoS prevention)
        if (humanMessage.length > MAX_INPUT_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Message too long. Max ${MAX_INPUT_LENGTH} characters allowed.`
            });
        }

        const trimmedMessage = humanMessage.trim();
        const timestamp = Date.now();
        const tokenKey = `token-${userId}`;
        // ✅ FIX 4: Per-chat memory key
        const memoryKey = `chat-${userId}-${chatId || 'new'}`;

        // ✅ FIX 2: Create chat if needed (now happens AFTER validation)
        if (!chatId || chatId === "" || chatId === null) {
            const { data, error } = await supabaseAdmin
                .from("chats")
                .insert({
                    user_id: userId,
                    // ✅ FIX 7: Empty messages, not "Hii" placeholder
                    messages: [],
                    // Optional: title from first message
                    title: trimmedMessage.substring(0, 50)
                })
                .select()
                .single(); // Use .single() for safety

            if (error) {
                console.error("Chat creation error:", error);
                return res.status(500).json({
                    success: false,
                    error: error.message
                });
            }

            if (!data) {
                return res.status(500).json({
                    success: false,
                    error: "Failed to create chat record"
                });
            }

            chatId = data.id;
        }

        // ✅ FIX 12: Safe token parsing
        let currentTokenUsage = parseInt(await redis.get(tokenKey)) || 0;
        if (isNaN(currentTokenUsage) || currentTokenUsage < 0) {
            currentTokenUsage = 0;
        }

        // ✅ FIX 9: Use 429 status code for token limit
        if (currentTokenUsage >= TOKEN_LIMIT) {
            console.log(`Token limit exceeded for user ${userId}: ${currentTokenUsage}`);
            return res.status(429).json({
                success: false,
                message: "Token limit exceeded. Please try again later.",
                TOKEN_USED: currentTokenUsage
            });
        }

        // ✅ FIX 6: Safe JSON parsing with try-catch
        let agent_Memory = [];
        try {
            const rawMemory = await redis.get(memoryKey);
            if (rawMemory) {
                const parsed = JSON.parse(rawMemory);
                if (Array.isArray(parsed)) {
                    agent_Memory = parsed;
                }
            }
        } catch (parseError) {
            console.error(`Corrupted memory cache for ${memoryKey}, resetting:`, parseError);
            agent_Memory = [];
            // Optionally delete corrupted key
            await redis.del(memoryKey).catch(() => {});
        }

        // ✅ FIX 13: Use null instead of empty string
        const promptWithFile = req.file || null;

        // ✅ FIX 5: Get LAST 50 messages (most recent), not first 50
        const recentMemory = agent_Memory.slice(-MEMORY_WINDOW);

        // Invoke AI graph
        const initialState = {
            prompt: trimmedMessage,
            agentMemory: recentMemory,
            promptWithFile: promptWithFile
        };

        const result = await graph.invoke(initialState);

        if (!result || !result.aiResponse) {
            throw new Error("Invalid response from AI graph");
        }

        // ✅ FIX 3: Use proper token count from graph result, fallback to length
        const tokensUsed = result.tokenUsage 
            || result.usage?.total_tokens 
            || Math.ceil(result.aiResponse.length / 4); // ~4 chars per token

        const newTokenTotal = currentTokenUsage + tokensUsed;

        // Prepare new messages
        const newMessages = [
            { role: "human", message: trimmedMessage, timestamp },
            { role: "ai", message: result.aiResponse, timestamp }
        ];

        // ✅ FIX 8: Cap memory to prevent unbounded growth
        const updated_agent_memory = [...agent_Memory, ...newMessages]
            .slice(-MAX_MEMORY_MESSAGES);

        // ✅ FIX 11: Update Redis FIRST, then DB (fail-safe pattern)
        // If DB fails, we still have the AI response in Redis temporarily
        await redis.set(memoryKey, JSON.stringify(updated_agent_memory), "EX", REDIS_TTL);
        await redis.set(tokenKey, newTokenTotal);

        // Now update database
        const { data: existingChat, error: fetchError } = await supabaseAdmin
            .from("chats")
            .select("messages")
            .eq("id", chatId)
            .maybeSingle();

        if (fetchError) {
            console.error("Fetch chat error:", fetchError);
            // Memory is updated, return partial success
            return res.status(200).json({
                success: true,
                warning: "Chat saved to cache but DB sync failed",
                agentUsed: result.agent,
                TOKEN_USED: newTokenTotal
            });
        }

        // ✅ FIX 2: Empty array fallback, NOT with humanMessage (would duplicate)
        const oldMessages = Array.isArray(existingChat?.messages) 
            ? existingChat.messages 
            : [];
        
        const updatedMessages = [...oldMessages, ...newMessages];

        const { data: updatedChat, error: updateError } = await supabaseAdmin
            .from("chats")
            .update({ 
                messages: updatedMessages,
                created_at: new Date().toISOString() // Track last activity
            })
            .eq("id", chatId)
            .select()
            .single();

        if (updateError) {
            console.error("Update chat error:", updateError);
            return res.status(500).json({
                success: false,
                error: updateError,
                TOKEN_USED: newTokenTotal
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedChat,
            agentUsed: result.agent,
            TOKEN_USED: newTokenTotal
        });

    } catch (err) {
        console.error("chatController error:", err);
        
        // Get current token usage safely for error response
        let tokenUsage = 0;
        try {
            tokenUsage = parseInt(await redis.get(`token-${userId}`)) || 0;
        } catch (e) {
            // Ignore Redis errors in error handler
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong while processing your request.",
            TOKEN_USED: tokenUsage,
            // Only include error details in development
            ...(process.env.NODE_ENV === 'development' && { error: err.message })
        });
    }
};

module.exports = { chatController };