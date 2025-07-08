const createRouter = require('../../shared/utils/routerFactory');
const authController = require('../../auth/controllers/authController');

const routes = [
  { method: 'post', path: '/login', handler: authController.login },
  // Puedes añadir más rutas de autenticación aquí, por ejemplo:
  // { method: 'post', path: '/register', handler: authController.register },
  // { method: 'post', path: '/logout', handler: authController.logout },
  // { method: 'post', path: '/refresh-token', handler: authController.refreshToken },
];

module.exports = createRouter(routes);