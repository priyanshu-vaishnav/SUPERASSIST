require("dotenv").config()

const app = require("./app/app.js")




app.listen(process.env.AGENT_PORT,()=>{
    console.log("Agent service running on port ",process.env.AGENT_PORT)
})
