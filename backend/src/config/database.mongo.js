const mongoose = require("mongoose");

async function connectMongo() {
  // Cambiamos MONGODB_URI por MONGO_URI para que coincida con tu .env
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "❌ No se encontró la URI de MongoDB en las variables de entorno",
    );
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "supcrud",
  });
}

module.exports = { connectMongo };
