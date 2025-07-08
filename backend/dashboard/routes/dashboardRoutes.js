const createRouter = require('../../shared/utils/routerFactory');
const dashboardController = require('../controllers/dashboardController');

const dashboardRoutes = [
    { method: 'get', path: '/option/:option', handler: dashboardController.getAllDashboard },
    { method: 'get', path: '/suppliers', handler: dashboardController.getAllCountSuppliers },
];

module.exports = createRouter(dashboardRoutes);
