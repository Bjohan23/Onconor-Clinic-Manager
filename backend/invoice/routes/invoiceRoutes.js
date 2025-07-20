const createRouter = require('../../shared/utils/routerFactory');
const invoiceController = require('../controllers/invoiceController');

const routes = [
  { method: 'get', path: '/', handler: invoiceController.getAll },
  { method: 'get', path: '/:id', handler: invoiceController.getById },
  { method: 'post', path: '/', handler: invoiceController.create },
  { method: 'put', path: '/:id', handler: invoiceController.update },
  { method: 'delete', path: '/:id', handler: invoiceController.remove },
];

module.exports = createRouter(routes); 