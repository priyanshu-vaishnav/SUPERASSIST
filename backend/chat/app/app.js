const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser")
 const chatRoutes = require("../routes/chat.routes.js")
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // Backend accepts cookies/credentials
}));

app.use(express.json())
app.use(cookieParser())



app.use("/api",chatRoutes)

app.get("/", (req, res) => {
    res.send("server is healthy")
})


module.exports = app

