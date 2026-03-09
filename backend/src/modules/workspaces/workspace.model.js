// ── workspace.model.js ──────────────────────────────────────
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.sql");

const Workspace = sequelize.define(
  "Workspace",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    workspaceKey: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "SUSPENDED"),
      defaultValue: "ACTIVE",
    },
    plan: { type: DataTypes.STRING(50), defaultValue: "Free" },
    aiMode: {
      type: DataTypes.ENUM("APPROVAL", "AUTO"),
      defaultValue: "APPROVAL",
    },
    autoAssignEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    confidenceThreshold: { type: DataTypes.FLOAT, defaultValue: 0.8 },
  },
  {
    tableName: "workspaces",
    underscored: true,
  },
);

module.exports = Workspace;
