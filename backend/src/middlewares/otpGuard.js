// ── otpGuard.js ──────────────────────────────────────────────
const jwt = require("jsonwebtoken");

module.exports = function otpGuard(req, res, next) {
  const token = req.headers["x-otp-token"];
  if (!token)
    return res.status(401).json({ error: "OTP access token required" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "ticket_view") throw new Error();
    req.otpData = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired OTP token" });
  }
};
