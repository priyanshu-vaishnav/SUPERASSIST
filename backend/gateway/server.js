require("dotenv").config();

const proxy = require("express-http-proxy");
const app = require("./app/app.js");
const proxyWithHeaders = require("./utils/proxyWithHeaders.js");

const authProxyOptions = {
    proxyReqOptions: {
        family: 4
    }
};

// 🚀 SERVER MODE (Local / Render)
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
    console.log("Running in Server Mode (Local/Render) - Express Proxies Active");
    
    // Render par strict custom ports use karenge kyunki dashboard setup automatic update nahi hua hai
    const authTarget = process.env.RENDER ? "http://127.0.0.1:10001" : (process.env.AUTH_GATEWAY || "http://127.0.0.1:3001");
    const chatTarget = process.env.RENDER ? "http://127.0.0.1:10002" : (process.env.CHAT_GATEWAY || "http://127.0.0.1:3002");
    const agentTarget = process.env.RENDER ? "http://127.0.0.1:10003" : (process.env.AGENT_GATEWAY || "http://127.0.0.1:3003");

    console.log(`[GATEWAY Proxy Routes] Auth -> ${authTarget} | Chat -> ${chatTarget} | Agent -> ${agentTarget}`);

    app.use("/auth", proxy(authTarget, authProxyOptions));
    app.use("/chat", proxyWithHeaders(chatTarget));
    app.use("/agent", proxyWithHeaders(agentTarget));

    app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
        console.log("Gateway running on port ", process.env.PORT || 3000);
    });
} 
else {
    console.log("Running in Vercel Production Mode - Native Rewrites Active");
    module.exports = app; 
}