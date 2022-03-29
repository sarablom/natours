const mongoose = require("mongoose");
const validator = require("validator");

//name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A user must have a name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "A user must have an email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, "A user must have a password"],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, "A user must have a password confirmation"]
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;