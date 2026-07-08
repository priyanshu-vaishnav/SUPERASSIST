const supabase = require("../config/supabase");


async function signIn(req, res) {

     const { username, email, password, avatar } = req.body

     if (!avatar || avatar === null) avatar = avatar;
     const { data, error } = supabase.auth.signUp({ email: email, password: password, options: { data: { username: username, avatar: avatar } } })
     if (!error) {

          const user = await supabase.from("users").insert({
             
               avatar,
               username,
               email,
               password,
          })
     }
}

module.exports = {signIn}