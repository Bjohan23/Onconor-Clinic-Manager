const  authService  = require('../services/authService');
const { sendSuccess, sendError } = require("../../shared/helpers/apiResponseHelper");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    sendSuccess(res, { user, token }, 'Inicio de sesión exitoso');
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

module.exports = { login };
