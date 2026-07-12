require("dotenv").config({path:"../.env"})
const { Redis } = require("ioredis")
const express = require("express")
const axios = require("axios")
const { supabase, supabaseAdmin } = require("../agent/config/supabase")
const app = express()

console.log(process.env.REDIS_HOST)
const redis = new Redis({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,

})
redis.on("connect", () => console.log("redis connected"))
redis.on("error", (err) => console.log(err))




app.listen(3005,()=>{
    console.log("redis service is running on port 3005")
})

module.exports = redis


