const createRouter = require('../../shared/utils/routerFactory');
const prescriptionController = require('../controllers/prescriptionController');

const routes = [
  { method: 'get', path: '/', handler: prescriptionController.getAll },
  { method: 'get', path: '/:id', handler: prescriptionController.getById },
  { method: 'post', path: '/', handler: prescriptionController.create },
  { method: 'put', path: '/:id', handler: prescriptionController.update },
  { method: 'delete', path: '/:id', handler: prescriptionController.remove },
];

module.exports = createRouter(routes); 