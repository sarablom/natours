const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.signup = async (req, res, next) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        });

        const token = signToken(newUser._id);

        res.status(201).json({
            status: "success",
            token,
            data: {
                user: newUser
            }
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        });
    }
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    //Has user sent in all fields?
    if (!email || !password) {
        return res.status(400).json({
            status: "fail",
            message: "Please provide email and password"
        });
    }

    //Check if user exists
    const user = await User.findOne({ email }).select("+password");

    //If user exists, check if password is correct
    const correct = await user.correctPassword(password, user.password);

    if (!user || !correct) {
        return res.status(401).json({
            status: "fail",
            message: "Incorrect email or password"
        });
    }

    //All is fine
    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        token
    });
}