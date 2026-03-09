const userService = require("./users.service.js");

async function getProfile(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updated = await userService.updateUser(req.user.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile };
