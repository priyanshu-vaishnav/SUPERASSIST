const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const supabase = require("../config/supabase");
const { authRouter } = require("../routes/auth.routes");
const app = express();

const allowedOrigins = [
  "http://localhost:5173",                 // Local Vite development environment
  "https://superassist-one.vercel.app"    // 🌟 Aapka live production frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Mobile apps, postman, ya server-to-server requests me origin nahi hota, unhe allow karne ke liye
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`[CORS Blocked] Request coming from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Cookies, authorization headers, aur sessions ko border cross karne ki ijaazat deta hai
}));

app.use(express.json())
app.use(cookieParser())



app.use("/api",authRouter)

app.get("/", (req, res) => {
    res.send("server is healthy")
})


module.exports = app

