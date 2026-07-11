const graph = require("../graph/graph");
const { supabase, supabaseAdmin } = require('../config/supabase')


const chatController = async (req, res) => {

    

    const userId = req.userId;
    const { chatId, humanMessage } = req.body;

    console.log(chatId,humanMessage)

    // Cleaned up validation & fixed the .status(400) typo
    if (!chatId || !humanMessage || !humanMessage.trim()) {
        return res.status(400).json({
            message: "bad request: chatId and humanMessage are required"
        });
    }

    const prompt = "";
    try {
        const initialState = {
            prompt: humanMessage.trim()
        };

        const result = await graph.invoke(initialState);


console.log("step-2")

        // 1. Pehle existing messages fetch karo
        const { data: existingChat, error: fetchError } = await supabaseAdmin
            .from("chats")
            .select("messages")
            .eq("id", chatId)
            .single();

        if (fetchError) {
            return res.status(500).json(fetchError);
        }


        const oldMessages = existingChat?.messages || [];
        const newMessages = [
            { role: "human", message: humanMessage },
            { role: "ai", message: result.aiResponse },
        ];

        const updatedMessages = [...oldMessages, ...newMessages];




        const { data, error } = await supabaseAdmin
            .from("chats")
            .update({ messages: updatedMessages })
            .eq("id", chatId)
            .select();

        if (!error) {
            console.log(result.agent)
            return res.status(200).json({
                data,
                agentUsed: result.agent
            });
        }
        return res.status(500).json(error);

    }
    catch (err) {
        console.error("chatController error:", err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while processing your request."
        });
    }
};



module.exports = { chatController }