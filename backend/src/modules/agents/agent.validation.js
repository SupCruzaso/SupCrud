const { body, param } = require("express-validator");

module.exports = {
  invite: [
    body("email").isEmail().withMessage("Email válido requerido"),
    body("role").optional().isIn(["ADMIN", "AGENT"]),
    body("ticketTypes").optional().isArray(),
    body("categories").optional().isArray(),
  ],
  update: [
    param("userId").isInt(),
    body("role").optional().isIn(["ADMIN", "AGENT"]),
    body("ticketTypes").optional().isArray(),
    body("categories").optional().isArray(),
  ],
};
