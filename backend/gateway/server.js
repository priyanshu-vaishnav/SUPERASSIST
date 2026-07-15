require("dotenv").config();

const proxy = require("express-http-proxy");
const app = require("./app/app.js");
const proxyWithHeaders = require("./utils/proxyWithHeaders.js");

// 🚀 RENDER YA LOCAL MODE
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
    console.log("Running in Server Mode (Local/Render) - Express Proxies Active");
    
    // 💡 IP BINDING FIX: Node 18+ ke liye 'localhost' ki jagah strictly '127.0.0.1' use kiya hai
    // Render ne jo dynamic ports detect kiye hain (10001, 10002, 10003), unhe fallback me set kar diya hai
    app.use("/auth", proxy(process.env.AUTH_GATEWAY || "http://127.0.0.1:10001"));
    app.use("/chat", proxyWithHeaders(process.env.CHAT_GATEWAY || "http://127.0.0.1:10002"));
    app.use("/agent", proxyWithHeaders(process.env.AGENT_GATEWAY || "http://127.0.0.1:10003"));

    // Main gateway ko 0.0.0.0 par strict bind kiya hai taaki Render ise scan kar sake
    app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
        console.log("Gateway running on port ", process.env.PORT || 3000);
    });
} 
// ☁️ VERCEL BACKUP
else {
    console.log("Running in Vercel Production Mode - Native Rewrites Active");
    module.exports = app; 
}