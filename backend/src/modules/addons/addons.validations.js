const { body, param } = require("express-validator");

module.exports = {
  update: [
    param("key").isString().notEmpty(),
    body("enabled").optional().isBoolean(),
    body("config").optional().isObject(),
  ],
};
