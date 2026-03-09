const { validationResult } = require("express-validator");

/**
 * Middleware para validar los resultados de express-validator
 * Si hay errores de validación, responde con un 400 y los detalles.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Error de validación de datos",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
