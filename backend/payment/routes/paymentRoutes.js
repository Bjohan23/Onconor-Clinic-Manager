const createRouter = require('../../shared/utils/routerFactory');
const paymentController = require('../controllers/paymentController');

const routes = [
  { method: 'get', path: '/', handler: paymentController.getAll },
  { method: 'get', path: '/:id', handler: paymentController.getById },
  { method: 'post', path: '/', handler: paymentController.create },
  { method: 'put', path: '/:id', handler: paymentController.update },
  { method: 'delete', path: '/:id', handler: paymentController.remove },
];

module.exports = createRouter(routes); 