const proxy = require("express-http-proxy")

const proxyWithHeaders = (serviceURL) => {
    return proxy(serviceURL, {
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            // 💡 FORCE IPv4 FIX: Node 18+ ke internalConnectMultiple error ko bypass karne ke liye
            proxyReqOpts.family = 4;

            // यदि मिडिलवेयर से userId मिली है, तो उसे हेडर में जोड़ें
            if (srcReq.userId) {
                proxyReqOpts.headers["x-user-id"] = srcReq.userId;
            }
            
            // 🌟 यह रिटर्न करना सबसे ज़रूरी है
            return proxyReqOpts; 
        }
    })
}

module.exports = proxyWithHeaders;