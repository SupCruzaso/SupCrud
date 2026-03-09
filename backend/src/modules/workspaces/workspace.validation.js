const { body } = require("express-validator");

const workspaceValidation = {
  create: [
    body("name")
      .isString()
      .trim()
      .isLength({ min: 3, max: 150 })
      .withMessage("Nombre inválido"),
    body("plan").optional().isIn(["Free", "Pro", "Enterprise"]),
  ],
  update: [
    body("name").optional().isString().trim(),
    body("aiMode").optional().isIn(["APPROVAL", "AUTO"]),
    body("confidenceThreshold").optional().isFloat({ min: 0, max: 1 }),
    body("autoAssignEnabled").optional().isBoolean(),
    body("status").optional().isIn(["ACTIVE", "SUSPENDED"]),
  ],
};

module.exports = workspaceValidation;
