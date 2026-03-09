const service = require("./tickets.service");

/**
 * Crea un ticket desde el widget (Público)
 */
async function create(req, res, next) {
  try {
    const ticket = await service.createTicket(req.body);
    res.status(201).json({
      referenceCode: ticket.referenceCode,
      id: ticket._id,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lista tickets con filtros y paginación (Para Agentes/Admins)
 */
async function list(req, res, next) {
  try {
    const result = await service.getTickets({
      workspaceId: req.workspace.id,
      ...req.query,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Actualiza el estado de un ticket
 */
async function updateStatus(req, res, next) {
  try {
    const ticket = await service.updateStatus({
      ticketId: req.params.id,
      status: req.body.status,
      actorId: req.user.id,
    });
    res.json(ticket);
  } catch (error) {
    next(error);
  }
}

/**
 * Asigna un agente a un ticket
 */
async function assign(req, res, next) {
  try {
    const ticket = await service.assignAgent({
      ticketId: req.params.id,
      agentId: req.body.agentId,
      actorId: req.user.id,
    });
    res.json(ticket);
  } catch (error) {
    next(error);
  }
}

/**
 * Agrega una respuesta (mensaje) al hilo
 */
async function addMessage(req, res, next) {
  try {
    const ticket = await service.addMessage({
      ticketId: req.params.id,
      senderType: "AGENT", // En el controller de dashboard siempre es AGENT
      senderId: req.user.id,
      senderName: req.user.name,
      content: req.body.content,
      attachments: req.body.attachments || [],
    });
    res.json(ticket);
  } catch (error) {
    next(error);
  }
}

/**
 * Aplica la sugerencia de la IA manualmente
 */
async function applyAI(req, res, next) {
  try {
    const ticket = await service.applyAISuggestion({
      ticketId: req.params.id,
      actorId: req.user.id,
    });
    res.json(ticket);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  list,
  updateStatus,
  assign,
  addMessage,
  applyAI,
};
