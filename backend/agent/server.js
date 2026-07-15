require("dotenv").config()

const app = require("./app/app.js")

// ... agar koi mongoose connection ya baki middlewares hain toh wo yahan rahenge

// 🚀 LOCAL DEVELOPMENT
// Local machine par ye purani tarah port par listen karega
// Kisi condition par depend mat raho, direct listen chalao
const AGENT_PORT = process.env.AGENT_PORT || 3003;
app.listen(AGENT_PORT, '0.0.0.0', () => {
    console.log(`[STRICT] Agent Service running on port ${AGENT_PORT}`);
});

module.exports = app;