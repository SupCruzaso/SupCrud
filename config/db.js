const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI; 
        
        if (!mongoURI || mongoURI.includes('tu_usuario')) {
            console.warn("[Alerta] No has puesto tu MONGO_URI real en el .env. Modo simulacion activado.");
            return;
        }

        await mongoose.connect(mongoURI);
        console.log("[MongoDB] Conectado exitosamente.");
    } catch (error) {
        console.error("[Error] Error conectando a MongoDB:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;