const User = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.find();

    res.status(200).json({
      status: "success",
      results: user.length,
      data: {
        user
      }
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error getting all users"
    });
  }
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!"
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!"
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!"
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!"
  });
};
