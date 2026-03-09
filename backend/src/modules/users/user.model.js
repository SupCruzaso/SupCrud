const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.sql");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.TEXT, allowNull: true }, // null for OAuth-only users
    googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
    role: {
      type: DataTypes.ENUM("OWNER", "ADMIN", "AGENT"),
      defaultValue: "AGENT",
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "users",
    underscored: true,
  },
);

module.exports = User;
