const { body } = require("express-validator");

module.exports = {
  login: [
    body("email").isEmail().withMessage("Debe ser un correo válido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  register: [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("La contraseña debe tener al menos 8 caracteres"),
  ],
};
