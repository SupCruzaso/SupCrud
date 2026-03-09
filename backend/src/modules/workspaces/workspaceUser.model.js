const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.sql");
const User = require("../users/user.model");
const Workspace = require("./workspace.model");

const WorkspaceUser = sequelize.define(
  "WorkspaceUser",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    workspaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Workspace, key: "id" },
    },
    role: { type: DataTypes.ENUM("ADMIN", "AGENT"), defaultValue: "AGENT" },
    ticketTypes: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] }, // P,Q,R,S
    categories: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  },
  {
    tableName: "workspace_users",
    underscored: true,
  },
);

User.belongsToMany(Workspace, { through: WorkspaceUser, foreignKey: "userId" });
Workspace.belongsToMany(User, {
  through: WorkspaceUser,
  foreignKey: "workspaceId",
});
WorkspaceUser.belongsTo(Workspace, {
  foreignKey: "workspaceId",
  as: "workspace",
});
WorkspaceUser.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = WorkspaceUser;
