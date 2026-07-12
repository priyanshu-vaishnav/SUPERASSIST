const { supabase, supabaseAdmin } = require('../config/supabase.js')
const { runAgent } = require('../services/chatService.js')
const axios = require('axios')


async function createChat(req, res) {

    const userId = req.userId
    const { data, error } = await supabaseAdmin.from("chats").insert({
        user_id: userId,

    })
    if (!error) {
        return res.status(200).json({
            data: data
        })
    }
    return res.status(500).json(error)




}

async function fetchChats(req, res) {

    const userId = req.userId
    const { data, error } = await supabaseAdmin.from("chats").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (!error) {
        return res.status(200).json({
            data
        })
    }
    return res.status(500).json(error)
}


async function fetchSingleChat(req, res) {

    const userId = req.userId
    const { chatId } = req.body
    const { data, error } = await supabaseAdmin.from("chats").select("*").eq("id", chatId).single()
    if (!error) {
        return res.status(200).json({
            data
        })
    }
    return res.status(500).json(error)
}
async function sendMessage(req, res) {


    const userId = req.userId;
    const { chatId, humanMessage } = req.body;

    // Cleaned up validation & fixed the .status(400) typo
    if (!chatId || !humanMessage || !humanMessage.trim()) {
        return res.status(400).json({
            message: "bad request: chatId and humanMessage are required"
        });
    }

    try {
        const response = await runAgent(humanMessage);
        const ai_response = response.reply;

        // 1. Pehle existing messages fetch karo
        const { data: existingChat, error: fetchError } = await supabaseAdmin
            .from("chats")
            .select("messages")
            .eq("id", chatId)
            .single();

        if (fetchError) {
            return res.status(500).json(fetchError);
        }

        // 2. Purane messages + naye do messages append karo
        const oldMessages = existingChat?.messages || [];
        const newMessages = [
            { role: "human", message: humanMessage },
            { role: "ai", message: ai_response },
        ];

        
        const updatedMessages = [...oldMessages, ...newMessages];



        // 3. Supabase me update karo
        const { data, error } = await supabaseAdmin
            .from("chats")
            .update({ messages: updatedMessages })
            .eq("id", chatId)
            .select();

        if (!error) {
            return res.status(200).json({ data });
        }
        return res.status(500).json(error);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }


}

async function deleteSingleChat(req, res) {
    const { chatId, id } = req.body
    

    const { data, error } = await supabaseAdmin.from("chats").delete().eq("id", chatId).single()
    if (!error) {
        return res.status(200).json({
            message: "chat deleted success fully"
        })
    }
    return res.status(500).json({
        error
    })

}

module.exports = { fetchChats, createChat, sendMessage, fetchSingleChat, deleteSingleChat }