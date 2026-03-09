const router = require("express").Router();
const { body, query } = require("express-validator");
const validate = require("../../middlewares/validate.js");
const authenticate = require("../../middlewares/authenticate.js");
const authorize = require("../../middlewares/authorize.js");
const workspaceGuard = require("../../middlewares/workspaceGuard.js");
const addonGuard = require("../../middlewares/addonGuard.js");
const otpGuard = require("../../middlewares/otpGuard.js");
const service = require("./tickets.service.js");

console.log({
  validate: typeof validate,
  authenticate: typeof authenticate,
  authorize: typeof authorize,
  workspaceGuard: typeof workspaceGuard,
  addonGuard: typeof addonGuard,
  otpGuard: typeof otpGuard,
});

// ── Helper ──────────────────────────────────────────────────
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new ticket (public, from widget)
 *     tags: [Tickets]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceKey, email, subject, description, type]
 *             properties:
 *               workspaceKey: { type: string }
 *               email:        { type: string, format: email }
 *               subject:      { type: string }
 *               description:  { type: string }
 *               type:         { type: string, enum: [P, Q, R, S] }
 *     responses:
 *       201: { description: Ticket created with referenceCode }
 *       404: { description: Workspace not found or suspended }
 */
router.post(
  "/",
  [
    body("workspaceKey").notEmpty(),
    body("email").isEmail(),
    body("subject").notEmpty().isLength({ max: 200 }),
    body("description").notEmpty(),
    body("type").isIn(["P", "Q", "R", "S"]),
  ],
  validate,
  wrap(async (req, res) => {
    console.log("[POST /tickets] body:", req.body); // ← debug temporal
    const ticket = await service.createTicket(req.body);
    res
      .status(201)
      .json({ referenceCode: ticket.referenceCode, id: ticket._id });
  }),
);

/**
 * @swagger
 * /api/tickets/public/{referenceCode}:
 *   get:
 *     summary: Get basic ticket info by reference code (no auth)
 *     tags: [Tickets]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: referenceCode
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Basic ticket info }
 *       404: { description: Ticket not found }
 */
router.get(
  "/public/:referenceCode",
  wrap(async (req, res) => {
    const data = await service.getByRef(req.params.referenceCode.toUpperCase());
    res.json(data);
  }),
);

/**
 * @swagger
 * /api/tickets/public/{referenceCode}/full:
 *   get:
 *     summary: Get full ticket after OTP validation
 *     tags: [Tickets]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: referenceCode
 *         required: true
 *         schema: { type: string }
 *       - in: header
 *         name: x-otp-token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Full ticket data }
 *       401: { description: Invalid or expired OTP token }
 */
router.get(
  "/public/:referenceCode/full",
  require("../../middlewares/otpGuard"),
  wrap(async (req, res) => {
    const data = await service.getFullByRef(
      req.params.referenceCode.toUpperCase(),
    );
    res.json(data);
  }),
);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: List tickets for a workspace (paginated)
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED, REOPENED] }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [P, Q, R, S] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Paginated ticket list }
 */
router.get(
  "/",
  authenticate,
  workspaceGuard,
  wrap(async (req, res) => {
    const result = await service.getTickets({
      workspaceId: req.workspace.id,
      ...req.query,
    });
    res.json(result);
  }),
);

/**
 * @swagger
 * /api/tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED, REOPENED] }
 *     responses:
 *       200: { description: Updated ticket }
 */
router.patch(
  "/:id/status",
  authenticate,
  workspaceGuard,
  [
    body("status").isIn([
      "OPEN",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
      "REOPENED",
    ]),
  ],
  validate,
  wrap(async (req, res) => {
    const ticket = await service.updateStatus({
      ticketId: req.params.id,
      status: req.body.status,
      actorId: req.user.id,
    });
    res.json(ticket);
  }),
);

/**
 * @swagger
 * /api/tickets/{id}/assign:
 *   patch:
 *     summary: Assign or reassign a ticket to an agent
 *     tags: [Tickets]
 */
router.patch(
  "/:id/assign",
  authenticate,
  workspaceGuard,
  authorize("ADMIN", "AGENT"),
  [body("agentId").isInt()],
  validate,
  wrap(async (req, res) => {
    const ticket = await service.assignAgent({
      ticketId: req.params.id,
      agentId: req.body.agentId,
      actorId: req.user.id,
    });
    res.json(ticket);
  }),
);

/**
 * @swagger
 * /api/tickets/{id}/messages:
 *   post:
 *     summary: Add a reply message to a ticket
 *     tags: [Tickets]
 */
router.post(
  "/:id/messages",
  authenticate,
  workspaceGuard,
  [body("content").notEmpty()],
  validate,
  wrap(async (req, res) => {
    const ticket = await service.addMessage({
      ticketId: req.params.id,
      senderType: "AGENT",
      senderId: req.user.id,
      senderName: req.user.name,
      content: req.body.content,
      attachments: req.body.attachments || [],
    });
    res.json(ticket);
  }),
);

/**
 * @swagger
 * /api/tickets/{id}/ai-apply:
 *   post:
 *     summary: Apply AI suggestion to ticket (APPROVAL mode)
 *     tags: [Tickets, AI]
 */
router.post(
  "/:id/ai-apply",
  authenticate,
  workspaceGuard,
  addonGuard("ai_assist"),
  wrap(async (req, res) => {
    const ticket = await service.applyAISuggestion({
      ticketId: req.params.id,
      actorId: req.user.id,
    });
    res.json(ticket);
  }),
);

module.exports = router;
