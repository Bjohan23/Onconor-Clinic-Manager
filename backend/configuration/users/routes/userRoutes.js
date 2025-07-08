const createRouter = require('../../../shared/utils/routerFactory');
const usersController = require('../controllers/usersController');

const routes = [
    { method: 'get', path: '/', handler: usersController.getAllUsers },
    { method: 'get', path: '/:id', handler: usersController.getUserById },
    { method: 'get', path: '/dni/:documento', handler: usersController.getUserByDni },
    { method: 'get', path: '/ruc/:documento', handler: usersController.getUserByRuc },
    { method: 'post', path: '/', handler: usersController.createUser },
    { method: 'put', path: '/:id', handler: usersController.updateUser },
    { method: 'delete', path: '/:id/:useridsession', handler: usersController.deleteUser },
];

module.exports = createRouter(routes);