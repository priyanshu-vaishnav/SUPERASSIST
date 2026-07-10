require("dotenv").config({path:"../.env"})
const app = require("./app/app.js")




app.listen(process.env.AGENT_PORT,()=>{
    console.log("ChatService running on port ",process.env.AGENT_PORT)
})