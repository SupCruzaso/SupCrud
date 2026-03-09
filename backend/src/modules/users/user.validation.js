const { body } = require("express-validator");

const userValidation = {
  create: [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password").isLength({ min: 8 }).withMessage("Mínimo 8 caracteres"),
    body("role").optional().isIn(["OWNER", "ADMIN", "AGENT"]),
  ],
  update: [
    body("name").optional().notEmpty(),
    body("email").optional().isEmail(),
    body("password").optional().isLength({ min: 8 }),
    body("isActive").optional().isBoolean(),
  ],
};

module.exports = userValidation;
