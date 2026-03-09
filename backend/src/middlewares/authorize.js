// ── authorize.js ─────────────────────────────────────────────
// authorize('ADMIN', 'OWNER') → only those roles pass
const WorkspaceUser = require("../modules/workspaces/workspaceUser.model.js");

module.exports = function authorize(...roles) {
  return async (req, res, next) => {
    // OWNER role is global (stored on User)
    if (req.user.role === "OWNER" && roles.includes("OWNER")) return next();

    if (!req.workspace)
      return res.status(403).json({ error: "Workspace context required" });

    const membership = await WorkspaceUser.findOne({
      where: { userId: req.user.id, workspaceId: req.workspace.id },
    });

    if (!membership || !roles.includes(membership.role)) {
      return res
        .status(403)
        .json({ error: `Requires role: ${roles.join(" or ")}` });
    }

    req.membership = membership;
    next();
  };
};
