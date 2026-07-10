const { supabaseAdmin, supabase } = require("../config/supabase");

async function Protection(req, res, next) {
    try {
        const token = req.cookies.token;

console.log(token)
        if (!token) {
            return res.status(401).json({
                message: "Authentication token missing. Please login again."
            });
        }

     
        const { data: { user }, error } = await supabase.auth.getUser(token);

  
        if (error) {
            return res.status(401).json({
                message: "Invalid or Expired token",
                error: error.message
            });
        }

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

 
        req.userId = user.id;
        next();

    } catch (err) {
        // Kisi bhi unexpected crash se bachne ke liye try-catch zaroori hai
        console.error("Auth Middleware Error:", err);
        return res.status(500).json({
            message: "Internal server error try again later"
        });
    }
}

module.exports = Protection;