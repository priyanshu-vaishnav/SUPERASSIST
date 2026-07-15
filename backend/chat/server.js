require("dotenv").config();

const app = require("./app/app.js"); // Ya jo bhi aapka express app instance hai

// ... agar koi database connection (mongoose) ya middlewares hain toh wo yahan rahenge

// 🚀 LOCAL DEVELOPMENT
// Agar local machine par chal raha hai, toh purani tarah port par listen karega
// Kisi condition par depend mat raho, direct listen chalao
const CHAT_PORT = process.env.CHAT_PORT || 3002;
app.listen(CHAT_PORT, '0.0.0.0', () => {
    console.log(`[STRICT] Chat Service running on port ${CHAT_PORT}`);
});

module.exports = app;