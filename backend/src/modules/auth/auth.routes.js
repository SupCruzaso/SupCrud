const router = require("express").Router();
const ctrl = require("./auth.controller");
const { body } = require("express-validator");
const validate = require("../../middlewares/validate.js");

/**
 * @swagger
 * /api/auth/owner/login:
 *   post:
 *     summary: Owner global login (only @crudzaso.com emails)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: team@crudzaso.com }
 *               password: { type: string }
 *     responses:
 *       200: { description: JWT token + user info }
 *       401: { description: Invalid credentials }
 *       403: { description: Not a @crudzaso.com email }
 */
router.post(
  "/owner/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  ctrl.ownerLogin,
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Workspace user login (ADMIN or AGENT)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: JWT token + workspaces list }
 *       401: { description: Invalid credentials }
 */
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  ctrl.workspaceLogin,
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new workspace user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string }
 *               email:    { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Email already registered }
 */
router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
  ],
  validate,
  ctrl.register,
);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Start Google OAuth flow
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302: { description: Redirect to Google }
 */
router.get("/google", (req, res) => {
  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=openid email profile`,
  );
});

router.get("/google/callback", ctrl.googleCallback);

module.exports = router;
