require("dotenv").config();

const proxy = require("express-http-proxy");
const app = require("./app/app.js");
const proxyWithHeaders = require("./utils/proxyWithHeaders.js");

// 🚀 RENDER YA LOCAL—Dono me proxies active hongi aur port listen karega!
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
    console.log("Running in Server Mode (Local/Render) - Express Proxies Active");
    
    // Agar Render par localhost link nahi milti, toh fallback automatic ports pakad lega
    app.use("/auth", proxy(process.env.AUTH_GATEWAY || "http://localhost:3001"));
    app.use("/chat", proxyWithHeaders(process.env.CHAT_GATEWAY || "http://localhost:3002"));
    app.use("/agent", proxyWithHeaders(process.env.AGENT_GATEWAY || "http://localhost:3003"));

    // Render automatically aapke main gateway ko port 10000 dega
    app.listen(process.env.PORT || 3000, () => {
        console.log("Gateway running on port ", process.env.PORT || 3000);
    });
} 
// ☁️ VERCEL BACKUP
else {
    console.log("Running in Vercel Production Mode - Native Rewrites Active");
    module.exports = app; 
}