const service = require("./workspaces.service.js");

// ── Existing controllers ─────────────────────────────────────
async function getUserWorkspaces(req, res, next) {
  try {
    const workspaces = await service.getWorkspacesByUserId(req.user.id);
    res.json({ status: "success", data: workspaces });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const workspace = await service.createWorkspace(req.user.id, req.body);
    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
}

async function getMyWorkspace(req, res, next) {
  try {
    res.json(req.workspace);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const updated = await service.updateWorkspace(req.workspace.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

// ── Agent controllers ────────────────────────────────────────
async function getAgents(req, res, next) {
  try {
    const data = await service.getAgents(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function removeAgent(req, res, next) {
  try {
    await service.removeAgent({
      workspaceId: req.params.id,
      agentId: req.params.agentId,
      actorId: req.user.id,
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

// ── Invitation controllers ────────────────────────────────────
async function sendInvitation(req, res, next) {
  try {
    const invitation = await service.sendInvitation({
      workspaceId: req.params.id,
      email: req.body.email,
      role: req.body.role || "AGENT",
      actorId: req.user.id,
    });
    res.status(201).json(invitation);
  } catch (error) {
    next(error);
  }
}

async function revokeInvitation(req, res, next) {
  try {
    await service.revokeInvitation({
      workspaceId: req.params.id,
      inviteId: req.params.inviteId,
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

async function acceptInvitation(req, res, next) {
  try {
    const FRONTEND = process.env.FRONTEND_URL || "http://127.0.0.1:5500";
    const { token } = req.query;
    const result = await service.acceptInvitation(token);

    if (result.needsRegister) {
      // User doesn't have an account yet — send to register with pre-filled data
      const params = new URLSearchParams({
        email: result.email,
        inviteToken: token,
        invited: "1",
      });
      return res.redirect(
        `${FRONTEND}/frontend/src/pages/workspace/login.html?${params}`,
      );
    }

    // User existed and was added — send to login
    res.redirect(
      `${FRONTEND}/frontend/src/pages/workspace/login.html?invited=1`,
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserWorkspaces,
  create,
  getMyWorkspace,
  update,
  getAgents,
  removeAgent,
  sendInvitation,
  revokeInvitation,
  acceptInvitation,
};
