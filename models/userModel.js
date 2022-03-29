const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "A user must have a password confirmation"],
        validate: {
            //This only works on CREATE and SAVE!!!
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords are not the same!"
        }
    }
});

userSchema.pre("save", async function(next) {
    //Only run this function if password was actually modified
    if (!this.isModified("password")) return next();

    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

//instance method - avaliable on all instances of the model
//check if correct password when user logs in
userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;