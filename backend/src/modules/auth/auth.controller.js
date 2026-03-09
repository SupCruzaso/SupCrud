// ── auth.controller.js ──────────────────────────────────────
const authService = require("./auth.service");

async function ownerLogin(req, res, next) {
  try {
    const result = await authService.loginOwner(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function workspaceLogin(req, res, next) {
  try {
    const result = await authService.loginWorkspace(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function register(req, res, next) {
  try {
    const result = await authService.registerWorkspace(req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function googleCallback(req, res) {
  // Passport populates req.user after Google OAuth
  const jwt = require("jsonwebtoken");
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.redirect(
    `${process.env.FRONTEND_URL}/workspace/selector.html?token=${token}`,
  );
}

module.exports = { ownerLogin, workspaceLogin, register, googleCallback };
