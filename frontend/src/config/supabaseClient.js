import {createClient} from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
const supabasePrivateKey = import.meta.env.VITE_SUPABASE_PRIVATE_KEY

console.log(supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables. Check your .env file alignment.")
}

const supabase = createClient(supabaseUrl, supabaseKey)
const supabaseAdmin = createClient(supabaseUrl, supabasePrivateKey)

module.exports = { supabase, supabaseAdmin }