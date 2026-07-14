const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const fs = require("fs")
const multer = require('multer');
const {PDFParse} = require("pdf-parse")
const upload = multer({ storage: multer.memoryStorage() });
const agentRouter = require("../routes/agent.routes.js");
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // Backend accepts cookies/credentials
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

