const router = require("express").Router();
const controller = require("./agents.controller.js");
const validation = require("./agent.validation.js");
const validate = require("../../middlewares/validate.js");
const authenticate = require("../../middlewares/authenticate.js");
const workspaceGuard = require("../../middlewares/workspaceGuard.js");
const authorize = require("../../middlewares/authorize.js");

// Todas las rutas de agentes requieren estar logueado y estar en un workspace
router.use(authenticate, workspaceGuard);

router.get("/", controller.list);

router.post(
  "/invite",
  authorize("ADMIN"),
  validation.invite,
  validate,
  controller.invite,
);

router.put(
  "/:userId",
  authorize("ADMIN"),
  validation.update,
  validate,
  controller.update,
);

router.delete("/:userId", authorize("ADMIN"), controller.remove);

module.exports = router;
