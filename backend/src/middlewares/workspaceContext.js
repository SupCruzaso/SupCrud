const Workspace = require("../modules/workspaces/workspace.model.js");

module.exports = async (req, res, next) => {
  const workspaceId = req.headers["x-workspace-id"];

  if (!workspaceId) {
    return next();
  }

  try {
    const workspace = await Workspace.findByPk(workspaceId);

    if (workspace) {
      req.workspace = workspace;
    }

    next();
  } catch (error) {
    next(error);
  }
};
