const service = require("./agents.service.js");

async function list(req, res, next) {
  try {
    const agents = await service.getAgentsByWorkspace(req.workspace.id);
    res.json(agents);
  } catch (error) {
    next(error);
  }
}

async function invite(req, res, next) {
  try {
    const newAgent = await service.addAgentToWorkspace(
      req.workspace.id,
      req.body,
    );
    res.status(201).json(newAgent);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const updated = await service.updateAgentPermissions(
      req.workspace.id,
      req.params.userId,
      req.body,
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const result = await service.removeAgent(
      req.workspace.id,
      req.params.userId,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { list, invite, update, remove };
