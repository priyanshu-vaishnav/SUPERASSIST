const express = require("express")
const chatRoute = express.Router()
const chat = require("../controller/chat.controllers")
const Protection = require("../middleware/auth.middleware")
chatRoute.post("/createchat", Protection, chat.createChat)
chatRoute.get("/fetchchats", Protection, chat.fetchChats)
chatRoute.post("/sendmessage", Protection, chat.sendMessage)
chatRoute.post("/fetchsinglechat", Protection, chat.fetchSingleChat)
chatRoute.post("/deletesinglechat", Protection, chat.deleteSingleChat)

module.exports = chatRoute