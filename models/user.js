const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

// Yeh plugin lagana **zaroori** hai
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
