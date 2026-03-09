// ── workspaceGuard.js ────────────────────────────────────────
const Workspace = require("../modules/workspaces/workspace.model");

module.exports = async function workspaceGuard(req, res, next) {
  const wsId =
    req.headers["x-workspace-id"] ||
    req.query.workspaceId ||
    req.body.workspaceId;
  if (!wsId)
    return res.status(400).json({ error: "x-workspace-id header required" });

  const ws = await Workspace.findByPk(wsId);
  if (!ws) return res.status(404).json({ error: "Workspace not found" });
  if (ws.status === "SUSPENDED")
    return res.status(403).json({ error: "Workspace is suspended" });

  req.workspace = ws;
  next();
};
