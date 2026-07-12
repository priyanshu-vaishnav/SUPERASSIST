const graph = require("../graph/graph");
const { supabase, supabaseAdmin } = require('../config/supabase');
const redis = require("../../shared/redis");


const chatController = async (req, res) => {



    const userId = req.userId;
    const { chatId, humanMessage } = req.body;

    /**
     * if the user exists than fetch there previous message otherwise insert first message on it
     */
    let agent_Memory = "";
    const isExists = redis.exists(`chat-${userId}`) 
    if (isExists) {

        const raw_previousConversations = await redis.get(`chat-${userId}`)
      
        agent_Memory = JSON.parse(raw_previousConversations)
       

    } else {


        agent_Memory = { role: "human", message: humanMessage }


    }



    if (!chatId || !humanMessage || !humanMessage.trim()) {
        return res.status(400).json({
            message: "bad request: chatId and humanMessage are required"
        });
    }

    const prompt = "";
    try {
        const initialState = {
            prompt: humanMessage.trim(),
            agentMemory: agent_Memory
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

        const oldMessages = existingChat?.messages || [];
        const newMessages = [
            { role: "human", message: humanMessage },
            { role: "ai", message: result.aiResponse },
        ];


        //if the user is new than we adding countinusly old + new messages
        const updated_agent_memory = [agent_Memory, ...newMessages]
        await redis.set(`chat-${userId}`, JSON.stringify(updated_agent_memory), "EX", 3600 * 24)
        const updatedMessages = [...oldMessages, ...newMessages];


        const { data, error } = await supabaseAdmin
            .from("chats")
            .update({ messages: updatedMessages })
            .eq("id", chatId)
            .select();

        if (!error) {

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