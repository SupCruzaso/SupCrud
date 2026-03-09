const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database.sql");

const Addon = sequelize.define(
  "Addon",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    key: { type: DataTypes.STRING(50), allowNull: false, unique: true }, // ej: 'ai_assist'
    description: { type: DataTypes.TEXT },
    enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    config: { type: DataTypes.JSON, defaultValue: {} }, // Para guardar API Keys o ajustes extra
  },
  {
    tableName: "addons",
    underscored: true,
  },
);

module.exports = Addon;
