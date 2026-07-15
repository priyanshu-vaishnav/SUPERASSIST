require("dotenv").config();
const proxy = require("express-http-proxy");
const app = require("./app/app.js");

// 🚀 LOCAL DEVELOPMENT
// Jab aap apni machine par 'npm run dev' chalayenge, toh ye port par listen karega
if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.AUTH_PORT || 3001, () => {
        console.log("AuthService running locally on port ", process.env.AUTH_PORT || 3001);
    });
}

// ☁️ VERCEL PRODUCTION
// Vercel serverless functions ko run karne ke liye app instance export hona chahiye
module.exports = app;