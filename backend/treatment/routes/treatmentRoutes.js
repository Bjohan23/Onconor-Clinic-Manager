const createRouter = require('../../shared/utils/routerFactory');
const treatmentController = require('../controllers/treatmentController');

const routes = [
  { method: 'get', path: '/', handler: treatmentController.getAll },
  { method: 'get', path: '/:id', handler: treatmentController.getById },
  { method: 'post', path: '/', handler: treatmentController.create },
  { method: 'put', path: '/:id', handler: treatmentController.update },
  { method: 'delete', path: '/:id', handler: treatmentController.remove },
];

module.exports = createRouter(routes); 