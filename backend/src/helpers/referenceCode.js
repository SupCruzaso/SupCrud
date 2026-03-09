/**
 * Helper para generar códigos de referencia únicos por Workspace.
 * Formato: [SIGLA]-[AÑO]-[SECUENCIA] (Ej: SUP-2026-001)
 */
const { sequelize } = require("../config/database.sql");
const Workspace = require("../modules/workspaces/workspace.model");

async function generateRef(workspaceKey) {
  try {
    // 1. Obtener el ID y el nombre del Workspace para la sigla
    const workspace = await Workspace.findOne({
      where: { workspaceKey },
      attributes: ["id", "name"],
    });

    if (!workspace) {
      throw new Error("Workspace no encontrado para generar referencia");
    }

    // 2. Definir el año actual
    const year = new Date().getFullYear();

    // 3. Contar cuántos tickets tiene este workspace en el año actual
    // Usamos una consulta directa para ser más precisos con el conteo
    const [result] = await sequelize.query(
      `SELECT COUNT(*) as total FROM tickets WHERE "workspaceId" = :workspaceId`,
      {
        replacements: { workspaceId: workspace.id },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    const nextNumber = parseInt(result.total) + 1;

    // 4. Crear la sigla (Primeras 3 letras del nombre en mayúsculas)
    const prefix = workspace.name.substring(0, 3).toUpperCase();

    // 5. Formatear el número con ceros a la izquierda (001, 002...)
    const paddedNumber = String(nextNumber).padStart(3, "0");

    return `${prefix}-${year}-${paddedNumber}`;
  } catch (error) {
    console.error("❌ Error en generateRef:", error.message);
    // Fallback en caso de error crítico para no bloquear el flujo
    return `TK-${Date.now()}`;
  }
}

module.exports = { generateRef };
