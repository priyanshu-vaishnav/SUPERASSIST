const express = require("express");
const cors = require("cors");
const supabase = require("../config/supabase");
const app = express();

app.use(cors())
app.use(express.json())


app.get("/", (req, res) => {
    res.send("server is healthy")
})


module.exports = app

