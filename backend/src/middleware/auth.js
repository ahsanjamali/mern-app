const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    console.log("Auth middleware - Headers:", req.headers);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No Authorization header found");
      return res.status(401).json({ message: "No authentication token found" });
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.log("No token found in Authorization header");
      return res.status(401).json({ message: "No authentication token found" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded successfully:", decoded);
      req.user = decoded;
      next();
    } catch (error) {
      console.log("Token verification failed:", error.message);
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = auth;
