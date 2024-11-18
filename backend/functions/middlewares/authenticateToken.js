const jwt = require("jsonwebtoken");
const tokenBlacklist = require("../models/tokenBlacklistModel");

const authenticateToken = async (req, res, next) => {
  let token =
    req.cookies.access_token ||
    req.cookies["access_token"] ||
    req.headers.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith("access_token="))
      ?.split("=")[1];

  if (!token) {
    const authHeader = req.headers["authorization"];
    token = authHeader && authHeader.split(" ")[1];
    console.log("Token from header:", req.cookies);
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    if (await tokenBlacklist.isBlacklisted(token)) {
      return res.status(401).json({ message: "Token is invalid" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticateToken;
