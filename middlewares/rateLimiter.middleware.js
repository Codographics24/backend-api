const LoginAttempt = require("../models/loginAttempt.model");

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

exports.limitLoginAttempts = async (req, res, next) => {
  const ip = req.ip;
  const email = req.body.email?.toLowerCase();

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  const attempts = await LoginAttempt.find({
    $or: [{ ip }, { email }],
    timestamp: { $gte: since },
    success: false,
  });

  if (attempts.length >= MAX_ATTEMPTS) {
    return res.status(429).json({
      error: "Too many failed login attempts. Please try again later.",
    });
  }

  next();
};
