const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

async function registerController(req, res) {
  try {
    const { email, password, fullname } = req.body;
    const { firstname, lastname } = fullname || {};

    if (!email || !password || !firstname || !lastname) {
      return res.status(400).json({
        message:
          "All fields (email, password, firstname, lastname) are required",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      email,
      password: hashedPassword,
      fullname: { firstname, lastname },
    });

    if (!user) {
      return res.status(500).json({ message: "User creation failed" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(201).json({
      message: `User ${firstname} registered successfully`,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
      },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(200).json({
      message: `${user.fullname.firstname} logged in successfully`,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}




async function logoutController(req, res) {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getMe(req, res) {
  try {
    // The user object is attached to the request by the auth middleware
    const user = req.user;
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
      },
    });
  } catch (err) {
    console.error("Get user info error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  registerController,
  loginController,
  logoutController,
  getMe,
};
