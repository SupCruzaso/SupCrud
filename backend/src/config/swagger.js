const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SupCrud by Crudzaso API",
      version: "1.0.0",
      description:
        "SaaS PQRS Management Platform API — Multi-tenant with AI-assisted routing.",
      contact: { name: "Crudzaso Team" },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Authentication & Authorization" },
      { name: "Workspaces", description: "Workspace management" },
      { name: "Tickets", description: "PQRS ticket operations" },
      { name: "Agents", description: "Agent management" },
      { name: "OTP", description: "One-time password verification" },
      { name: "Add-ons", description: "Add-on activation and management" },
    ],
  },
  apis: ["./src/modules/**/*.routes.js"],
};

module.exports = swaggerJSDoc(options);
