require("dotenv").config()

const app = require("./app/app.js")

// ... agar koi mongoose connection ya baki middlewares hain toh wo yahan rahenge

// 🚀 LOCAL DEVELOPMENT
// Local machine par ye purani tarah port par listen karega
if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.AGENT_PORT || 3003, () => {
        console.log("Agent service running locally on port ", process.env.AGENT_PORT || 3003)
    })
}

// ☁️ VERCEL PRODUCTION
// Vercel serverless function ke liye app export karna mandatory hai
module.exports = app;