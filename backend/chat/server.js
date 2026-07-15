require("dotenv").config();

const app = require("./app/app.js"); // Ya jo bhi aapka express app instance hai

// ... agar koi database connection (mongoose) ya middlewares hain toh wo yahan rahenge

// 🚀 LOCAL DEVELOPMENT
// Agar local machine par chal raha hai, toh purani tarah port par listen karega
if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.CHAT_PORT || 3002, () => {
        console.log("ChatService running locally on port ", process.env.CHAT_PORT || 3002);
    });
}

// ☁️ VERCEL PRODUCTION
// Vercel ke liye Express app instance ko export karna zaroori hai
module.exports = app;