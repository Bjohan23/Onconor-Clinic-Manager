const createRouter = require('../../shared/utils/routerFactory');
const medicalExamController = require('../controllers/medicalExamController');

const routes = [
  { method: 'get', path: '/', handler: medicalExamController.getAll },
  { method: 'get', path: '/:id', handler: medicalExamController.getById },
  { method: 'post', path: '/', handler: medicalExamController.create },
  { method: 'put', path: '/:id', handler: medicalExamController.update },
  { method: 'delete', path: '/:id', handler: medicalExamController.remove },
];

module.exports = createRouter(routes); 