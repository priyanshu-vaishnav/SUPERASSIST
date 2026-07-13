require("dotenv").config({path:"../.env"})

const proxy = require("express-http-proxy")
const app = require("./app/app.js")

// const dns = require('node:dns');
// dns.setServers(['8.8.8.8', '1.1.1.1']);
// const dbConnect = require("./config/db.js")
// dbConnect();



app.listen(process.env.CHAT_PORT,()=>{
    console.log("ChatService running on port ",process.env.CHAT_PORT)
})