const mongoose = require("mongoose")
const dbConnect = async () => {

    try {
        console.log(process.env.MONGO_AUTH_URL)
        await mongoose.connect(process.env.MONGO_AUTH_URL);
        console.log("DB Connected ✅")
    }
    catch (err) {
        console.log(err)
    }

}

module.exports = dbConnect