const router = require("express").Router();
const controller = require("./users.controller.js");
const validation = require("./user.validation.js");
const validate = require("../../middlewares/validate.js");
const authenticate = require("../../middlewares/authenticate.js");

// Rutas de perfil personal
router.get("/me", authenticate, controller.getProfile);
router.put(
  "/me",
  authenticate,
  validation.update,
  validate,
  controller.updateProfile,
);

module.exports = router;
