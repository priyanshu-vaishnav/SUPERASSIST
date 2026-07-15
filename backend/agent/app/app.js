const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const fs = require("fs")
const multer = require('multer');
const {PDFParse} = require("pdf-parse")
const upload = multer({ storage: multer.memoryStorage() });
const agentRouter = require("../routes/agent.routes.js");
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







app.post('/pdf', upload.single("file"), async (req, res) => {


  try {
    // 1. Access the file directly from req.file (not req.file.pdf)
    const pdfFile = req.file;

    if (!pdfFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    
    const fileBuffer = pdfFile.buffer;
    const parser = new PDFParse({data:fileBuffer})
    const pdfContent = (await parser.getText()).text

    return res.json({ pdfContent});
  } catch (err) {
    // Always return a proper error status code
    return res.status(500).json({ error: err.message });
  }


})

app.use("/api", agentRouter)

app.get("/", (req, res) => {
  res.send("server is healthy")
})


module.exports = app

