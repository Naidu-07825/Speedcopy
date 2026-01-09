const jwt = require("jsonwebtoken");
module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.warn("ROLE_AUTH: Token missing for", req.method, req.path);
      return res.status(401).json({ message: "Token missing" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("ROLE_AUTH: Token decoded -> role:", decoded.role, "id:", decoded.id || decoded._id);

      if (!allowedRoles.includes(decoded.role)) {
        console.warn("ROLE_AUTH: Access denied for role", decoded.role, "on", req.path);
        return res.status(403).json({ message: "Access denied" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      console.warn("ROLE_AUTH: Invalid token ->", err.message);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};