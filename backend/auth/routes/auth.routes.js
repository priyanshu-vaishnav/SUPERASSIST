const express = require("express")
const authRouter = express.Router()
const authController = require("../controller/auth.controllers.js")
const Protection = require("../middleware/auth.middleware.js")

authRouter.post("/signup",authController.signUp)
authRouter.post("/signin",authController.signIn)
authRouter.get("/getme",Protection,authController.getMe)
authRouter.post('/signout',Protection,authController.signOut)

module.exports = {authRouter}