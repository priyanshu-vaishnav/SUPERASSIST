const { supabase, supabaseAdmin } = require("../config/supabase");

async function signUp(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Fill all the fields"
        });
    }

    const { data, error } = await supabase.auth.signUp({ 
        email: email, 
        password: password, 
        options: { data: { username: username } } 
    });

    if (!error) {
        // Database me user record insert karna
        await supabaseAdmin.from("users").insert({
            id: data.user.id,
            username,
            email,
            password,
        });

        // 🌟 RUNTIME CRASH FIX: Agar instant login session mila hai (Email verification OFF hai)
        if (data.session) {
            res.cookie("token", data.session.access_token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000 // 1 din
            });
        }

        return res.status(201).json({
            user: data.user,
            message: data.session ? "Registration successful!" : "Please check your email to verify your account."
        });
    }

    return res.status(500).json({ error });
}

async function signIn(req, res) {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (!error) {
        res.cookie("token", data.session.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000 // 1 din
        });

        return res.status(200).json({
            user: data.user
        });
    }
    return res.status(500).json(error);
}

async function getMe(req, res) {
    const { data: userrecord, error: dbError } = await supabaseAdmin
        .from("users")
        .select("email, username")
        .eq('id', req.userId)
        .single();

    if (dbError || !userrecord) {
        return res.status(404).json({ message: "User record not found in database" });
    }

    return res.status(200).json(userrecord);
}

async function signOut(req, res) {
    // 🌟 COOKIE CLEAR FIX: Cross-site cookie ko delete karne ke liye options pass karne zaroori hain
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    return res.status(200).json("signout");
}

module.exports = { signUp, signIn, getMe, signOut };