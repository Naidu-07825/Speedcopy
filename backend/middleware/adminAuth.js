const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);    
    let user = await User.findById(decoded.id);
    if (!user) {
      const admin = await Admin.findById(decoded.id);
      if (!admin) return res.status(403).json({ message: "Admin access only" });      
      req.user = { id: admin._id.toString(), email: admin.email, role: "admin" };
      return next();
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};