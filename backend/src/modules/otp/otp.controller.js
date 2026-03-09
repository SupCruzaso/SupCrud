const jwt = require("jsonwebtoken");
const mailer = require("../../helpers/mailer");
const Ticket = require("../tickets/ticket.schema");

// ── 1. Enviar OTP al correo del usuario ─────────────────────
const sendOTP = async (req, res, next) => {
  try {
    const { referenceCode } = req.body;

    // Buscar el ticket para obtener el email del dueño
    const ticket = await Ticket.findOne({
      referenceCode: referenceCode.toUpperCase(),
    });
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });

    // Generar código de 6 dígitos aleatorio
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar el OTP temporalmente en el documento del ticket (o una colección aparte)
    // Para simplificar en Riwi, lo guardaremos en el ticket con una expiración de 10 min
    ticket.currentOTP = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60000), // 10 minutos
    };
    await ticket.save();

    // Enviar el correo usando tu helper mailer
    await mailer.sendOTPEmail({
      to: ticket.email,
      otpCode,
      referenceCode: ticket.referenceCode,
    });

    res.json({ message: "Código enviado a tu correo registrado" });
  } catch (error) {
    next(error);
  }
};

// ── 2. Verificar OTP y entregar Token de Acceso ──────────────
const verifyOTP = async (req, res, next) => {
  try {
    const { referenceCode, otpCode } = req.body;

    const ticket = await Ticket.findOne({
      referenceCode: referenceCode.toUpperCase(),
    });

    if (!ticket || !ticket.currentOTP) {
      return res.status(401).json({ error: "No se ha solicitado un código" });
    }

    // Validar expiración y coincidencia
    if (new Date() > ticket.currentOTP.expiresAt) {
      return res.status(401).json({ error: "El código ha expirado" });
    }

    if (ticket.currentOTP.code !== otpCode) {
      return res.status(401).json({ error: "Código incorrecto" });
    }

    // Limpiar el OTP usado para que no se use dos veces
    ticket.currentOTP = undefined;
    await ticket.save();

    // Generar el JWT que tu otpGuard.js está esperando
    const token = jwt.sign(
      {
        ticketId: ticket._id,
        referenceCode: ticket.referenceCode,
        purpose: "ticket_view",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      token,
      message: "Acceso concedido",
      email: ticket.email,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendOTP, verifyOTP };
