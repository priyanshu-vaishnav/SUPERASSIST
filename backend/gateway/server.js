require("dotenv").config();

const proxy = require("express-http-proxy");
const app = require("./app/app.js");
const proxyWithHeaders = require("./utils/proxyWithHeaders.js");

// 🚀 LOCAL ENVIRONMENT (Aapki machine par)
if (process.env.NODE_ENV !== 'production') {
    console.log("Running in Local Mode - Express Proxies Active");
    app.use("/auth", proxy(process.env.AUTH_GATEWAY));
    app.use("/chat", proxyWithHeaders(process.env.CHAT_GATEWAY));
    app.use("/agent", proxyWithHeaders(process.env.AGENT_GATEWAY));

    app.listen(process.env.PORT || 3000, () => {
        console.log("Default gateway running on port ", process.env.PORT || 3000);
    });
} 
// ☁️ PRODUCTION ENVIRONMENT (Vercel Serverless)
else {
    console.log("Running in Vercel Production Mode - Native Rewrites Active");
    
    // Agar Gateway khud koi user details ya custom headers add karta hai, 
    // toh aap sirf us specific middleware ko yahan laga sakte hain.
    // Vercel rewrites automatically headers ko destination tak le jayega.
    
    module.exports = app; // Vercel ke liye export karna mandatory hai
}