const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
});

async function connectSQL() {
  await sequelize.authenticate();
  if (process.env.NODE_ENV !== "production") {
    await sequelize.sync({ alter: false });
  }
}

module.exports = { sequelize, connectSQL };
