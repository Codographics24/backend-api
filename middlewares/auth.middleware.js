const jwt = require("jsonwebtoken");

// JWT Authentication Middleware
exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Check if authorization token is missing
  if (!authHeader) {
    return res.status(403).json({ error: "Authorization token missing" });
  }

  // Extract the token from the 'Bearer <token>' format
  const token = authHeader.split(" ")[1];

  // Verify JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT authentication failed:", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    // Attach user to request object and proceed
    req.user = user;
    next();
  });
};
