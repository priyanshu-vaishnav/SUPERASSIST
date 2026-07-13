require("dotenv").config({path:"../.env"})

const proxy = require("express-http-proxy")
const app = require("./app/app.js")
const  proxyWithHeaders = require("./utils/proxyWithHeaders.js")

app.use("/auth",proxy(process.env.AUTH_GATEWAY))
app.use("/chat",proxyWithHeaders(process.env.CHAT_GATEWAY))
app.use("/agent",proxyWithHeaders(process.env.AGENT_GATEWAY))




app.listen(process.env.PORT,()=>{
    console.log("default gateway running on port ",process.env.PORT)
})