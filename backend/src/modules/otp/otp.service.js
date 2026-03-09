const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Otp = require("./otp.schema");
const Ticket = require("../tickets/ticket.schema");
const mailer = require("../../helpers/mailer");

const MAX_ATTEMPTS = 3;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutos de vida

/**
 * Genera un código numérico seguro de 6 dígitos
 */
function generateCode() {
  return String(crypto.randomInt(100000, 999999));
}

/**
 * Procesa la solicitud de un nuevo código
 */
async function requestOtp(referenceCode) {
  // 1. Verificar existencia del ticket
  const ticket = await Ticket.findOne({ referenceCode }).lean();
  if (!ticket) {
    throw Object.assign(new Error("Ticket no encontrado"), { status: 404 });
  }

  // 2. Invalidar OTPs previos para este ticket (Seguridad)
  await Otp.updateMany({ referenceCode, used: false }, { used: true });

  // 3. Crear nuevo registro de OTP
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await Otp.create({
    referenceCode,
    email: ticket.email,
    code,
    expiresAt,
  });

  // 4. Enviar correo (Usamos el helper mailer que actualizamos)
  await mailer.sendOTPEmail({
    to: ticket.email,
    otpCode: code,
    referenceCode,
  });

  // 5. Retornar pista del email para el Widget
  const [local, domain] = ticket.email.split("@");
  return { emailHint: `${local[0]}****@${domain}` };
}

/**
 * Verifica el código y entrega el token de acceso
 */
async function verifyOtp(referenceCode, code) {
  // 1. Buscar el último OTP activo
  const otp = await Otp.findOne({ referenceCode, used: false }).sort({
    createdAt: -1,
  });

  if (!otp) {
    throw Object.assign(
      new Error("No se encontró un código activo. Solicita uno nuevo."),
      {
        status: 400,
      },
    );
  }

  // 2. Validar expiración
  if (new Date() > otp.expiresAt) {
    otp.used = true;
    await otp.save();
    throw Object.assign(new Error("El código ha expirado"), { status: 400 });
  }

  // 3. Control de intentos (Brute Force Protection)
  otp.attempts++;
  if (otp.attempts > MAX_ATTEMPTS) {
    otp.used = true;
    await otp.save();
    throw Object.assign(
      new Error("Demasiados intentos. Solicita un nuevo código."),
      {
        status: 400,
      },
    );
  }

  // 4. Validar coincidencia
  if (otp.code !== code) {
    await otp.save();
    throw Object.assign(
      new Error(
        `Código inválido. Te quedan ${MAX_ATTEMPTS - otp.attempts} intento(s).`,
      ),
      { status: 400 },
    );
  }

  // 5. Éxito: Marcar como usado y registrar evento en el ticket
  otp.used = true;
  await otp.save();

  await Ticket.updateOne(
    { referenceCode },
    {
      $push: {
        events: {
          type: "OTP_VALIDATED",
          actor: otp.email,
          metadata: { referenceCode },
        },
      },
    },
  );

  // 6. Generar el JWT para el otpGuard.js
  const accessToken = jwt.sign(
    { referenceCode, email: otp.email, purpose: "ticket_view" },
    process.env.JWT_SECRET,
    { expiresIn: "30m" },
  );

  return { accessToken };
}

module.exports = { requestOtp, verifyOtp };
