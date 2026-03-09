const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.sql");

const WorkspaceAddon = sequelize.define(
  "WorkspaceAddon",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    workspaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "workspaces",
        key: "id",
      },
    },
    addonName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Ej: openai_classification, advanced_reports",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Configuraciones específicas del addon",
    },
  },
  {
    tableName: "workspace_addons",
    underscored: true,
    timestamps: true,
  },
);

module.exports = WorkspaceAddon;
