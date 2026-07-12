const { Redis } = require("ioredis")
const express = require("express")
const axios = require("axios")
const { supabase, supabaseAdmin } = require("../agent/config/supabase")
const app = express()
const redis = new Redis({
    username: 'default',
    password: '6Hj9SlwOBCLJh0kZpzBz7dBVf5ypRrEs',
    host: 'speedy-spot-daughter-11039.db.redis.io',
    port: 10801

})
redis.on("connect", () => console.log("redis connected"))
redis.on("error", (err) => console.log(err))




app.listen(3005,()=>{
    console.log("redis service is running on port 3005")
})

module.exports = redis


