const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    //Convert to miliseconds
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    //Cannot be accessed or modified by the browser
    //Prevents Cross-site scripting attacks
    httpOnly: true
  };

  if (process.env.NODE_ENV === "production") {
    //Will only be sent on HTTPS connections
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);

  //Dont show user password in response
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
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

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err
    });
  }
};

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
};

exports.protect = async (req, res, next) => {
  //Get token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  //If no token, return error
  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "You are not logged in"
    });
  }

  //Verify token
  const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //Extract user id
  const user = await User.findById(decodedToken.id);

  //If no user, return error
  if (!user) {
    return res.status(401).json({
      status: "fail",
      message: "The user belonging to this token does no longer exist"
    });
  }

  //Add user to req
  req.user = user;

  next();
};
