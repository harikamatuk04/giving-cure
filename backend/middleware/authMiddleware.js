const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify JWT token
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(500).json({ error: "Authentication error", details: error.message });
  }
};

// Middleware to check if user is RUSH
exports.isRUSH = (req, res, next) => {
  if (req.user.hospital !== "RUSH") {
    return res.status(403).json({ error: "Access denied. RUSH users only." });
  }
  next();
};

