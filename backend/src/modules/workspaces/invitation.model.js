const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.sql");
const Workspace = require("./workspace.model");

const Invitation = sequelize.define(
  "Invitation",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    workspaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Workspace, key: "id" },
    },
    email: { type: DataTypes.STRING(200), allowNull: false },
    role: { type: DataTypes.ENUM("ADMIN", "AGENT"), defaultValue: "AGENT" },
    token: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM("PENDING", "ACCEPTED", "REVOKED"),
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "invitations",
    underscored: true,
  },
);

Invitation.belongsTo(Workspace, { foreignKey: "workspaceId", as: "workspace" });

module.exports = Invitation;
