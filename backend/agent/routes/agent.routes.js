const express = require("express")
const Controller = require("../controller/chat.controller")
const Protection = require("../middleware/auth.middleware")
const agentRouter = express.Router()


agentRouter.post("/chat",Protection, Controller.chatController)
module.exports = agentRouter

