require("dotenv").config();

const proxy = require("express-http-proxy");
const app = require("./app/app.js");
const proxyWithHeaders = require("./utils/proxyWithHeaders.js");

// 💡 Force IPv4 Function taaki connection refusal na aaye
const proxyOptions = {
    proxyReqOptions: {
        family: 4 // Strict IPv4 resolution force karega (No IPv6 loopback confusion)
    }
};

// 🚀 RENDER YA LOCAL MODE
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
    console.log("Running in Server Mode (Local/Render) - Express Proxies Active");
    
    // proxyOptions object ko teesre ya dusre argument me pass karo binding fix karne ke liye
    app.use("/auth", proxy(process.env.AUTH_GATEWAY || "http://127.0.0.1:10001", proxyOptions));
    
    // Note: Agar proxyWithHeaders custom utility hai, toh uske andar jao (utils/proxyWithHeaders.js) 
    // aur wahan express-http-proxy ke call me `proxyReqOptions: { family: 4 }` ko merge kar do.
    app.use("/chat", proxyWithHeaders(process.env.CHAT_GATEWAY || "http://127.0.0.1:10002", proxyOptions));
    app.use("/agent", proxyWithHeaders(process.env.AGENT_GATEWAY || "http://127.0.0.1:10003", proxyOptions));

    app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
        console.log("Gateway running on port ", process.env.PORT || 3000);
    });
} 
else {
    console.log("Running in Vercel Production Mode - Native Rewrites Active");
    module.exports = app; 
}