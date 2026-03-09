require("dotenv").config();
const app = require("./src/app");
const { connectSQL } = require("./src/config/database.sql");
const { connectMongo } = require("./src/config/database.mongo");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectSQL();
    console.log("✅ PostgreSQL connected");

    await connectMongo();
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 SupCrud API running on port ${PORT}`);
      console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
