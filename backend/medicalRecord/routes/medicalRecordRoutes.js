const createRouter = require('../../shared/utils/routerFactory');
const medicalRecordController = require('../controllers/medicalRecordController');

const routes = [
  { method: 'get', path: '/', handler: medicalRecordController.getAll },
  { method: 'get', path: '/:id', handler: medicalRecordController.getById },
  { method: 'post', path: '/', handler: medicalRecordController.create },
  { method: 'put', path: '/:id', handler: medicalRecordController.update },
  { method: 'delete', path: '/:id', handler: medicalRecordController.remove },
];

module.exports = createRouter(routes); 