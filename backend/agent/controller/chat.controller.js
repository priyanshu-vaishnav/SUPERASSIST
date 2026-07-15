const graph = require("../graph/graph");
const { supabase, supabaseAdmin } = require('../config/supabase');
const redis = require("../../shared/redis");


const chatController = async (req, res) => {


    const userId = req.userId;
    const { chatId, humanMessage } = req.body;


    

    let agent_Memory = [];
    let token_Usage = 0;

    token_Usage = await redis.get(`token-${userId}`)
   

    if (token_Usage >= 55000) {
        console.log("overused token")

        return res.status(500).json({
            success: false,
            message: "Something went wrong while processing your request.",
            TOKEN_USED: token_Usage
        });
    }

    const isExists = await redis.exists(`chat-${userId}`); // NOTE: await missing tha yahan bhi!

    if (isExists) {
        const raw_previousConversations = await redis.get(`chat-${userId}`);
        agent_Memory = JSON.parse(raw_previousConversations);


        if (!Array.isArray(agent_Memory)) {
            agent_Memory = [];
        }
    } else {
        agent_Memory = [];
    }

    if (!chatId || !humanMessage || !humanMessage.trim()) {
        return res.status(400).json({
            message: "bad request: chatId and humanMessage are required"
        });
    }


    let promptWithFile = null
    if (req.file) {
      
        promptWithFile = req.file
    } else {
       
        promptWithFile = ""
    }

    try {
        // Sirf last 6 messages bhejo agent ko (poori history nahi)
        const recentMemory = agent_Memory.slice(0,50);

        const initialState = {
            prompt: humanMessage.trim(),
            agentMemory: recentMemory,
            promptWithFile: promptWithFile
        };

        const result = await graph.invoke(initialState);



        const { data: existingChat, error: fetchError } = await supabaseAdmin
            .from("chats")
            .select("messages")
            .eq("id", chatId)
            .single();

        if (fetchError) {
            return res.status(500).json(fetchError);
        }

        //setting token usage for the user 
        const total_token_usage = (Number(token_Usage) + result.aiResponse.length);
        await redis.set(`token-${userId}`, total_token_usage)




        const oldMessages = existingChat?.messages || [];
        const newMessages = [
            { role: "human", message: humanMessage },
            { role: "ai", message: result.aiResponse },
        ];

        // Ab flat array me hi add hoga, wrap nahi hoga
        const updated_agent_memory = [...agent_Memory, ...newMessages];

        await redis.set(
            `chat-${userId}`,
            JSON.stringify(updated_agent_memory),
            "EX",
            3600 * 24
        );

        const updatedMessages = [...oldMessages, ...newMessages];

        const { data, error } = await supabaseAdmin
            .from("chats")
            .update({ messages: updatedMessages })
            .eq("id", chatId)
            .select();

        if (!error) {

            
            return res.status(200).json({
                data,
                agentUsed: result.agent,
                TOKEN_USED: token_Usage
            });
        }
        return res.status(500).json(error);

    } catch (err) {
        console.error("chatController error:", err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while processing your request.",
            TOKEN_USED: token_Usage
        });
    }
};



module.exports = { chatController }