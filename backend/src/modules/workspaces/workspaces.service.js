const crypto = require("crypto");
const Workspace = require("./workspace.model.js");
const WorkspaceUser = require("./workspaceUser.model.js");
const Invitation = require("./invitation.model.js");
const User = require("../users/user.model.js");
const mailer = require("../../helpers/mailer.js");

// ── Existing services ────────────────────────────────────────
async function getWorkspacesByUserId(userId) {
  const userMemberships = await WorkspaceUser.findAll({
    where: { userId },
    include: [
      {
        model: Workspace,
        as: "workspace",
        attributes: ["id", "name", "workspaceKey", "status"],
      },
    ],
  });
  return userMemberships.map((m) => m.workspace).filter((ws) => ws !== null);
}

async function createWorkspace(userId, data) {
  const workspaceKey = `sup_${crypto.randomBytes(12).toString("hex")}`;
  const workspace = await Workspace.create({ ...data, workspaceKey });
  await WorkspaceUser.create({
    userId,
    workspaceId: workspace.id,
    role: "ADMIN",
    ticketTypes: ["P", "Q", "R", "S"],
  });
  return workspace;
}

async function getWorkspaceById(id) {
  const workspace = await Workspace.findByPk(id);
  if (!workspace)
    throw Object.assign(new Error("Workspace not found"), { status: 404 });
  return workspace;
}

async function updateWorkspace(id, data) {
  const workspace = await getWorkspaceById(id);
  return await workspace.update(data);
}

// ── Agent services ───────────────────────────────────────────
async function getAgents(workspaceId) {
  // Get active agents with their user info
  const memberships = await WorkspaceUser.findAll({
    where: { workspaceId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "role"],
      },
    ],
  });

  const agents = memberships
    .filter((m) => m.user !== null)
    .map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      active: true,
      openTicketsCount: 0, // Can be enriched later with MongoDB query
    }));

  // Get pending invitations
  const invites = await Invitation.findAll({
    where: { workspaceId, status: "PENDING" },
    attributes: ["id", "email", "role", "expiresAt", "createdAt"],
  });

  return { agents, invites };
}

async function removeAgent({ workspaceId, agentId, actorId }) {
  const membership = await WorkspaceUser.findOne({
    where: { workspaceId, userId: agentId },
  });

  if (!membership)
    throw Object.assign(new Error("Agent not found in this workspace"), {
      status: 404,
    });

  // Prevent removing yourself
  if (String(membership.userId) === String(actorId))
    throw Object.assign(
      new Error("You cannot remove yourself from the workspace"),
      { status: 400 },
    );

  await membership.destroy();
  return true;
}

// ── Invitation services ──────────────────────────────────────
async function sendInvitation({ workspaceId, email, role, actorId }) {
  const workspace = await getWorkspaceById(workspaceId);

  // Check if user is already a member
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const alreadyMember = await WorkspaceUser.findOne({
      where: { workspaceId, userId: existingUser.id },
    });
    if (alreadyMember)
      throw Object.assign(
        new Error("This user is already a member of the workspace"),
        { status: 409 },
      );
  }

  // Check if there's already a pending invitation
  const existingInvite = await Invitation.findOne({
    where: { workspaceId, email, status: "PENDING" },
  });
  if (existingInvite)
    throw Object.assign(
      new Error("An invitation is already pending for this email"),
      { status: 409 },
    );

  // Generate secure token — expires in 48h
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const invitation = await Invitation.create({
    workspaceId,
    email,
    role,
    token,
    expiresAt,
  });

  // Send invitation email
  const acceptUrl = `${process.env.API_URL || "http://localhost:3000"}/api/workspaces/invitations/accept?token=${token}`;
  await mailer.sendInvitationEmail({
    to: email,
    workspaceName: workspace.name,
    role,
    acceptUrl,
    expiresAt,
  });

  return invitation;
}

async function revokeInvitation({ workspaceId, inviteId }) {
  const invitation = await Invitation.findOne({
    where: { id: inviteId, workspaceId, status: "PENDING" },
  });
  if (!invitation)
    throw Object.assign(new Error("Invitation not found or already used"), {
      status: 404,
    });

  await invitation.update({ status: "REVOKED" });
  return true;
}

async function acceptInvitation(token) {
  const invitation = await Invitation.findOne({
    where: { token, status: "PENDING" },
  });

  if (!invitation)
    throw Object.assign(new Error("Invalid or expired invitation token"), {
      status: 404,
    });

  if (new Date() > invitation.expiresAt)
    throw Object.assign(new Error("This invitation has expired"), {
      status: 410,
    });

  // Find user by email
  const user = await User.findOne({ where: { email: invitation.email } });

  // If user doesn't exist yet, return signal to redirect to register
  if (!user) return { needsRegister: true, email: invitation.email, token };

  // User exists — add to workspace immediately
  const alreadyMember = await WorkspaceUser.findOne({
    where: { workspaceId: invitation.workspaceId, userId: user.id },
  });

  if (!alreadyMember) {
    await WorkspaceUser.create({
      userId: user.id,
      workspaceId: invitation.workspaceId,
      role: invitation.role,
      ticketTypes: ["P", "Q", "R", "S"],
    });
  }

  await invitation.update({ status: "ACCEPTED" });
  return { needsRegister: false };
}

// Called from auth.service after registration with invite token
async function finalizeInvitation(token, userId) {
  const invitation = await Invitation.findOne({
    where: { token, status: "PENDING" },
  });
  if (!invitation) return false;

  const alreadyMember = await WorkspaceUser.findOne({
    where: { workspaceId: invitation.workspaceId, userId },
  });

  if (!alreadyMember) {
    await WorkspaceUser.create({
      userId,
      workspaceId: invitation.workspaceId,
      role: invitation.role,
      ticketTypes: ["P", "Q", "R", "S"],
    });
  }

  await invitation.update({ status: "ACCEPTED" });
  return true;
}

module.exports = {
  getWorkspacesByUserId,
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  getAgents,
  removeAgent,
  sendInvitation,
  revokeInvitation,
  acceptInvitation,
  finalizeInvitation,
};
