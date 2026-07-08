require("dotenv").config({path:"../.env"})
const proxy = require("express-http-proxy")
const app = require("./app/app.js")

app.use("/auth",proxy(process.env.AUTH_GATEWAY))




app.listen(process.env.PORT,()=>{
    console.log("default gw running on port ",process.env.PORT)
})