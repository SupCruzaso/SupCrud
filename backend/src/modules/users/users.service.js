const User = require("./user.model.js");
const bcrypt = require("bcrypt");

/**
 * Crea un nuevo usuario (Agente/Admin)
 */
async function createUser(data) {
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  const user = await User.create(data);
  const userJson = user.toJSON();
  delete userJson.passwordHash;
  return userJson;
}

/**
 * Obtiene perfil por ID
 */
async function getUserById(id) {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["passwordHash"] },
  });
  if (!user)
    throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
  return user;
}

/**
 * Actualiza datos del usuario
 */
async function updateUser(id, data) {
  const user = await User.findByPk(id);
  if (!user)
    throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }

  return await user.update(data);
}

module.exports = { createUser, getUserById, updateUser };
