const { body, query, param } = require("express-validator");

const ticketValidation = {
  // Validación para creación desde el Widget
  create: [
    body("workspaceKey").notEmpty().withMessage("Workspace Key es requerida"),
    body("email").isEmail().withMessage("Email inválido"),
    body("subject").notEmpty().isLength({ max: 200 }).trim(),
    body("description").notEmpty().withMessage("La descripción es obligatoria"),
    body("type")
      .isIn(["P", "Q", "R", "S"])
      .withMessage("Tipo de ticket inválido"),
  ],

  // Validación para cambiar estado
  updateStatus: [
    param("id").isMongoId().withMessage("ID de ticket inválido"),
    body("status").isIn([
      "OPEN",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
      "REOPENED",
    ]),
  ],

  // Validación para asignación
  assign: [
    param("id").isMongoId().withMessage("ID de ticket inválido"),
    body("agentId").isInt().withMessage("El ID del agente debe ser un número"),
  ],

  // Validación para mensajes
  addMessage: [
    param("id").isMongoId().withMessage("ID de ticket inválido"),
    body("content")
      .notEmpty()
      .trim()
      .withMessage("El contenido no puede estar vacío"),
  ],

  // Filtros de búsqueda
  list: [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status")
      .optional()
      .isIn(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"]),
    query("priority").optional().isIn(["LOW", "MEDIUM", "HIGH"]),
  ],
};

module.exports = ticketValidation;
