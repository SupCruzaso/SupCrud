const router = require("express").Router();
const controller = require("./workspaces.controller.js");
const validation = require("./workspace.validation.js");
const validate = require("../../middlewares/validate.js");
const authenticate = require("../../middlewares/authenticate.js");
const authorize = require("../../middlewares/authorize.js");
const workspaceGuard = require("../../middlewares/workspaceGuard.js");
const { body } = require("express-validator");

// ── Workspace CRUD ───────────────────────────────────────────
router.post("/", authenticate, validation.create, validate, controller.create);
router.get("/config", authenticate, workspaceGuard, controller.getMyWorkspace);
router.get("/my-workspaces", authenticate, controller.getUserWorkspaces);
router.put(
  "/config",
  authenticate,
  workspaceGuard,
  authorize("ADMIN"),
  validation.update,
  validate,
  controller.update,
);

// ── Agents ───────────────────────────────────────────────────
/**
 * GET /api/workspaces/:id/agents
 * Returns all active agents + pending invitations for a workspace
 */
router.get("/:id/agents", authenticate, workspaceGuard, controller.getAgents);

/**
 * DELETE /api/workspaces/:id/agents/:agentId
 * Removes a user from the workspace (WorkspaceUser row)
 */
router.delete(
  "/:id/agents/:agentId",
  authenticate,
  workspaceGuard,
  authorize("ADMIN"),
  controller.removeAgent,
);

// ── Invitations ──────────────────────────────────────────────
/**
 * POST /api/workspaces/:id/invitations
 * Sends an invitation email to a new agent
 */
router.post(
  "/:id/invitations",
  authenticate,
  workspaceGuard,
  authorize("ADMIN"),
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("role")
      .isIn(["ADMIN", "AGENT"])
      .withMessage("Role must be ADMIN or AGENT"),
  ],
  validate,
  controller.sendInvitation,
);

/**
 * DELETE /api/workspaces/:id/invitations/:inviteId
 * Revokes a pending invitation
 */
router.delete(
  "/:id/invitations/:inviteId",
  authenticate,
  workspaceGuard,
  authorize("ADMIN"),
  controller.revokeInvitation,
);

/**
 * GET /api/invitations/accept?token=xxx
 * Public endpoint — accepts an invitation via token link from email
 */
router.get("/invitations/accept", controller.acceptInvitation);

module.exports = router;
