require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar a Base de Datos
connectDB();

// Rutas API
app.use('/api/tickets', ticketRoutes);

// Servir la carpeta public donde esta tu HTML
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`[Servidor] Corriendo en http://localhost:${PORT}`);
});