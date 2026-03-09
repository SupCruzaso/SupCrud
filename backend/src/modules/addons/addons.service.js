const Addon = require("./addons.model.js");
const WorkspaceAddon = require("./workspace-addon.model.js");

/**
 * Obtiene todos los addons disponibles y su estado
 */
async function getAllAddons() {
  return await Addon.findAll({ order: [["id", "ASC"]] });
}

/**
 * Obtiene un addon por su key técnica
 */
async function getAddonByKey(key) {
  const addon = await Addon.findOne({ where: { key } });
  if (!addon)
    throw Object.assign(new Error("Add-on no encontrado"), { status: 404 });
  return addon;
}

/**
 * Activa/Desactiva o configura un add-on
 */
async function updateAddon(key, data) {
  const addon = await getAddonByKey(key);
  return await addon.update(data);
}

async function activateAddonInWorkspace(data) {
  const newActivation = await WorkspaceAddon.create({
    workspaceId: data.workspaceId,
    addonName: data.addonName,
    config: data.config,
    isActive: true,
  });

  return newActivation;
}

module.exports = {
  getAllAddons,
  getAddonByKey,
  updateAddon,
  activateAddonInWorkspace,
};
