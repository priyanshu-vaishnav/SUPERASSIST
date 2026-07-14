const express = require("express")
const Controller = require("../controller/chat.controller")
const Protection = require("../middleware/auth.middleware")
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const agentRouter = express.Router()


agentRouter.post("/chat",Protection,upload.single("file"), Controller.chatController)
module.exports = agentRouter

