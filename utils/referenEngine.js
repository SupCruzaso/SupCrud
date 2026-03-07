const crypto = require('crypto');
const Ticket = require('../models/Ticket'); // Tu modelo de Mongoose

const generateUniqueRefCode = async () => {
    let isUnique = false;
    let refCode = '';

    while (!isUnique) {
        // Genera 6 caracteres aleatorios en Hexadecimal y los pasa a Mayúsculas
        const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
        refCode = `#REF-${randomStr}`;

        // Verifica contra la base de datos si ya existe
        const existingTicket = await Ticket.findOne({ referenceCode: refCode });
        
        if (!existingTicket) {
            isUnique = true; // Rompe el ciclo si está libre
        }
    }
    
    return refCode;
};

module.exports = { generateUniqueRefCode };