const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authMiddlerware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "unauthorized access , please login first",
    });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({
      _id: decode.id,
    });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "invalid token , please login again",
    });
  }
}

module.exports = authMiddlerware;
