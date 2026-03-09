const WorkspaceUser = require("../workspaces/workspaceUser.model.js");
const User = require("../users/user.model.js");

/**
 * Lista todos los agentes de un workspace con sus datos de usuario
 */
async function getAgentsByWorkspace(workspaceId) {
  return await WorkspaceUser.findAll({
    where: { workspaceId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "isActive"],
      },
    ],
  });
}

/**
 * Agrega un usuario existente como agente a un workspace
 */
async function addAgentToWorkspace(
  workspaceId,
  { email, role, ticketTypes, categories },
) {
  // 1. Buscar si el usuario existe en el sistema
  const user = await User.findOne({ where: { email } });
  if (!user)
    throw Object.assign(new Error("El usuario no existe en la plataforma"), {
      status: 404,
    });

  // 2. Verificar si ya es miembro de este workspace
  const exists = await WorkspaceUser.findOne({
    where: { userId: user.id, workspaceId },
  });
  if (exists)
    throw Object.assign(
      new Error("El usuario ya es miembro de este workspace"),
      { status: 400 },
    );

  // 3. Crear la relación
  return await WorkspaceUser.create({
    userId: user.id,
    workspaceId,
    role: role || "AGENT",
    ticketTypes: ticketTypes || [],
    categories: categories || [],
  });
}

/**
 * Actualiza permisos o rol de un agente
 */
async function updateAgentPermissions(workspaceId, userId, data) {
  const membership = await WorkspaceUser.findOne({
    where: { workspaceId, userId },
  });
  if (!membership)
    throw Object.assign(new Error("Relación no encontrada"), { status: 404 });

  return await membership.update(data);
}

/**
 * Elimina a un agente del workspace
 */
async function removeAgent(workspaceId, userId) {
  const deleted = await WorkspaceUser.destroy({
    where: { workspaceId, userId },
  });
  if (!deleted)
    throw Object.assign(new Error("Agente no encontrado en este workspace"), {
      status: 404,
    });
  return { message: "Agente eliminado del workspace" };
}

module.exports = {
  getAgentsByWorkspace,
  addAgentToWorkspace,
  updateAgentPermissions,
  removeAgent,
};
