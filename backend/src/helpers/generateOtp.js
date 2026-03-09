const crypto = require("crypto");

/**
 * Genera un código numérico seguro de longitud variable
 * @param {number} length - Por defecto 6 dígitos
 * @returns {string}
 */
function generateOtpCode(length = 6) {
  if (length <= 0) return "";

  // Usamos crypto para asegurar que el número no sea predecible (CSPRNG)
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return String(crypto.randomInt(min, max + 1));
}

module.exports = { generateOtpCode };
