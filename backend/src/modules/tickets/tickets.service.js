const Ticket = require("./ticket.schema.js");
const { generateRef } = require("../../helpers/referenceCode.js");
const mailer = require("../../helpers/mailer.js");
const openaiAssist = require("../../helpers/openaiAssist.js");
const Workspace = require("../workspaces/workspace.model.js");
const Addon = require("../addons/addons.model.js");

// ── Create ticket (from widget / public) ────────────────────
async function createTicket({
  workspaceKey,
  email,
  subject,
  description,
  type,
  attachments = [],
}) {
  const workspace = await Workspace.findOne({
    where: { workspaceKey, status: "ACTIVE" },
  });

  if (!workspace) {
    const err = new Error("Workspace not found or suspended");
    err.status = 404;
    throw err;
  }

  const referenceCode = await generateRef(workspace.workspaceKey);

  const ticket = await Ticket.create({
    referenceCode,
    workspaceId: workspace.id,
    email,
    subject,
    description,
    type,
    events: [{ type: "CREATED", actor: email, metadata: { type, subject } }],
    messages: [
      {
        senderType: "USER",
        senderName: email,
        content: description,
        attachments,
      },
    ],
  });

  try {
    const aiAddon = await Addon.findOne({
      where: { workspaceId: workspace.id, key: "ai_assist", enabled: true },
    });
    if (aiAddon) {
      const suggestion = await openaiAssist.classifyTicket({
        subject,
        description,
        type,
      });
      ticket.aiSuggestion = suggestion;
      ticket.events.push({
        type: "AI_CLASSIFIED",
        actor: "AI",
        metadata: suggestion,
      });
      if (
        workspace.aiMode === "AUTO" &&
        suggestion.confidence >= workspace.confidenceThreshold
      ) {
        ticket.priority = suggestion.priority;
        ticket.tags = suggestion.tags;
        ticket.category = suggestion.category;
        ticket.assignedTo = suggestion.agentId;
        ticket.aiSuggestion.applied = true;
        ticket.events.push({
          type: "AI_APPLIED",
          actor: "AI",
          metadata: suggestion,
        });
      }
      await ticket.save();
    }
  } catch (aiErr) {
    console.warn("[AI] Classification failed:", aiErr.message);
  }

  try {
    await mailer.sendTicketConfirmation({ to: email, referenceCode, subject });
  } catch (mailErr) {
    console.warn("[Mailer] Confirmation email failed:", mailErr.message);
  }

  return ticket;
}

// ── Get tickets (paginated + filtered) ──────────────────────
async function getTickets({
  workspaceId,
  status,
  type,
  priority,
  assignedTo,
  page = 1,
  limit = 20,
  search,
}) {
  const filter = { workspaceId };
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = parseInt(assignedTo);
  if (search) filter.$text = { $search: search };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [data, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Ticket.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// ── Get by referenceCode (public) ────────────────────────────
async function getByRef(referenceCode) {
  const ticket = await Ticket.findOne({ referenceCode }).lean();
  if (!ticket)
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  return {
    referenceCode: ticket.referenceCode,
    subject: ticket.subject,
    status: ticket.status,
    type: ticket.type,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

// ── Get full ticket (after OTP) ──────────────────────────────
async function getFullByRef(referenceCode) {
  const ticket = await Ticket.findOne({ referenceCode }).lean();
  if (!ticket)
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  return ticket;
}

// ── Update status ────────────────────────────────────────────
async function updateStatus({ ticketId, status, actorId }) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket)
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  const prev = ticket.status;
  ticket.status = status;
  if (status === "CLOSED") ticket.closedAt = new Date();
  ticket.events.push({
    type: "STATUS_CHANGED",
    actor: String(actorId),
    metadata: { from: prev, to: status },
  });
  await ticket.save();
  return ticket;
}

// ── Assign agent ─────────────────────────────────────────────
async function assignAgent({ ticketId, agentId, actorId }) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket)
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  const prev = ticket.assignedTo;
  ticket.assignedTo = agentId;
  ticket.events.push({
    type: "ASSIGNED",
    actor: String(actorId),
    metadata: { from: prev, to: agentId },
  });
  await ticket.save();
  return ticket;
}

// ── Add message ──────────────────────────────────────────────
async function addMessage({
  ticketId,
  senderType,
  senderId,
  senderName,
  content,
  attachments = [],
}) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket)
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  ticket.messages.push({
    senderType,
    senderId: String(senderId),
    senderName,
    content,
    attachments,
  });
  ticket.events.push({ type: "REPLIED", actor: senderName, metadata: {} });
  if (ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
    ticket.status = "REOPENED";
    ticket.events.push({
      type: "STATUS_CHANGED",
      actor: senderName,
      metadata: { from: ticket.status, to: "REOPENED" },
    });
  }
  await ticket.save();
  return ticket;
}

// ── Apply AI suggestion ──────────────────────────────────────
async function applyAISuggestion({ ticketId, actorId }) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket?.aiSuggestion)
    throw Object.assign(new Error("No AI suggestion available"), {
      status: 400,
    });
  const s = ticket.aiSuggestion;
  ticket.priority = s.priority || ticket.priority;
  ticket.tags = s.tags || ticket.tags;
  ticket.category = s.category || ticket.category;
  ticket.assignedTo = s.agentId || ticket.assignedTo;
  ticket.aiSuggestion.applied = true;
  ticket.events.push({
    type: "AI_APPLIED",
    actor: String(actorId),
    metadata: s,
  });
  await ticket.save();
  return ticket;
}

// ── ⚠️ ESTO ES LO QUE FALTABA ────────────────────────────────
module.exports = {
  createTicket,
  getTickets,
  getByRef,
  getFullByRef,
  updateStatus,
  assignAgent,
  addMessage,
  applyAISuggestion,
};
