const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middlewares/errorHandler");

// Routes
const authRoutes = require("./modules/auth/auth.routes");
const workspaceRoutes = require("./modules/workspaces/workspace.routes");
const userRoutes = require("./modules/users/user.routes");
const ticketRoutes = require("./modules/tickets/ticket.routes");
const agentRoutes = require("./modules/agents/agent.routes");
const otpRoutes = require("./modules/otp/otp.routes");
const addonRoutes = require("./modules/addons/addons.routes.js");

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ── Global Middleware ──────────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Passport strategies
require("./modules/auth/auth.service").initPassport(passport);

// ── API Routes ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/addons", addonRoutes);

// ── Swagger ────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Health check ───────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SupCrud by Crudzaso",
    timestamp: new Date(),
  });
});

// ── Error handler ──────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
