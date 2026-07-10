const express = require("express")
const cors = require("cors")
const app = express();
exports.app = app;
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // Backend accepts cookies/credentials
}));
app.use(express.json())


app.get("/",(req,res)=>{
    res.send("server is healthy")
})


module.exports = app