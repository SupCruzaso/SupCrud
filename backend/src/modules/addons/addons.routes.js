const router = require("express").Router();
const controller = require("./addons.controller.js");
const validation = require("./addons.validations.js");
const validate = require("../../middlewares/validate.js");
const workspaceContext = require("../../middlewares/workspaceContext.js");
const authenticate = require("../../middlewares/authenticate.js");
const authorize = require("../../middlewares/authorize.js");

// Middleware global para este router: Debes estar autenticado
router.use(authenticate);
router.use(workspaceContext);

// Solo el OWNER de la plataforma puede ver y gestionar add-ons globales
router.get("/", authorize("OWNER"), controller.list);

router.get("/:key", authorize("OWNER"), controller.getOne);

router.put(
  "/:key",
  authorize("OWNER"),
  validation.update,
  validate,
  controller.update,
);

router.post("/activate", authorize("ADMIN", "OWNER"), controller.activateAddon);

module.exports = router;
