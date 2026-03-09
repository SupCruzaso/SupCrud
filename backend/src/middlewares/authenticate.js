// ── authenticate.js ─────────────────────────────────────────
const jwt = require("jsonwebtoken");
const User = require("../modules/users/user.model");

module.exports = async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["passwordHash"] },
    });
    if (!user || !user.isActive)
      return res.status(401).json({ error: "Invalid token" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
