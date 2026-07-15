require("dotenv").config(); // dotenvx aur Render automatic root .env utha lenge
const { Redis } = require("ioredis");

const redis = new Redis({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

redis.on("connect", () => console.log("🟢 Redis client connected successfully"));
redis.on("error", (err) => console.log("🔴 Redis Connection Error:", err));

// 🌟 Kisi app.listen(3005) ki zaroorat nahi hai yahan!
// Bas is pure connection object ko export kar do taaki chat aur agent ise use kar sakein.
module.exports = redis;