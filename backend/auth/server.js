require("dotenv").config();
const proxy = require("express-http-proxy");
const app = require("./app/app.js");

// 🚀 LOCAL DEVELOPMENT
// Jab aap apni machine par 'npm run dev' chalayenge, toh ye port par listen karega
// Kisi condition par depend mat raho, Render/Local sabme chalega
const AUTH_PORT = process.env.AUTH_PORT || 3001;
app.listen(AUTH_PORT, '0.0.0.0', () => {
    console.log(`[STRICT] Auth Service running on port ${AUTH_PORT}`);
});

module.exports = app;