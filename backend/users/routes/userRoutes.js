const createRouter = require('../../shared/utils/routerFactory');
const usersController = require('../controllers/usersController');

const routes = [
    // { method: 'get', path: '/', handler: usersController.getAllUsers },
];

module.exports = createRouter(routes);