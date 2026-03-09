// ── addonGuard.js ────────────────────────────────────────────
const Addon = require("../modules/addons/addons.model.js");
const WorkspaceAddon = require("../modules/addons/workspace-addon.model");

/**
 * Usage: router.use(addonGuard('attachments'))
 * Checks that the add-on is both globally enabled and active for the workspace.
 */
module.exports = function addonGuard(addonKey) {
  return async (req, res, next) => {
    if (!req.workspace)
      return res.status(400).json({ error: "Workspace context required" });

    const addon = await Addon.findOne({
      where: { key: addonKey, enabled: true },
    });
    if (!addon) {
      return res
        .status(403)
        .json({
          error: `Add-on '${addonKey}' is not available on this platform`,
        });
    }

    const wsAddon = await WorkspaceAddon.findOne({
      where: { addonId: addon.id, workspaceId: req.workspace.id, active: true },
    });
    if (!wsAddon) {
      return res
        .status(403)
        .json({
          error: `Add-on '${addonKey}' is not enabled for this workspace`,
        });
    }

    req.addon = addon;
    next();
  };
};
