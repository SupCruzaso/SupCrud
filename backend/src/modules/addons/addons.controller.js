const service = require("./addons.service.js");

async function list(req, res, next) {
  try {
    const addons = await service.getAllAddons();
    res.json(addons);
  } catch (error) {
    next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const addon = await service.getAddonByKey(req.params.key);
    res.json(addon);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const updated = await service.updateAddon(req.params.key, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function activateAddon(req, res, next) {
  try {
    const activated = await service.activateAddonInWorkspace(req.body);
    res.status(201).json(activated);
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getOne, update, activateAddon };
