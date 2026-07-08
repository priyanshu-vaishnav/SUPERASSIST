require('dotenv').config({ path: "backend/.env" })
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

console.log(supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables. Check your .env file alignment.")
}

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase