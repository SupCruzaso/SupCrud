const { Schema, model } = require("mongoose");

const MessageSchema = new Schema(
  {
    senderType: {
      type: String,
      enum: ["USER", "AGENT", "SYSTEM", "AI"],
      required: true,
    },
    senderId: { type: String, default: null },
    senderName: { type: String, default: "User" },
    content: { type: String, required: true },
    attachments: [
      { url: String, publicId: String, filename: String, mimetype: String },
    ],
  },
  { timestamps: true },
);

const EventSchema = new Schema(
  {
    type: { type: String, required: true }, // CREATED, STATUS_CHANGED, ASSIGNED, OTP_VALIDATED, AI_APPLIED
    actor: { type: String, default: "SYSTEM" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

const TicketSchema = new Schema(
  {
    referenceCode: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: Number, required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },

    currentOTP: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
    },

    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["P", "Q", "R", "S"], required: true },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"],
      default: "OPEN",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    assignedTo: { type: Number, default: null }, // userId
    tags: [String],
    category: { type: String, default: null },
    aiSuggestion: {
      category: String,
      priority: String,
      tags: [String],
      agentId: Number,
      confidence: Number,
      applied: { type: Boolean, default: false },
    },
    messages: [MessageSchema],
    events: [EventSchema],
    closedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Text search index
TicketSchema.index({ subject: "text", description: "text" });

module.exports = model("Ticket", TicketSchema);
