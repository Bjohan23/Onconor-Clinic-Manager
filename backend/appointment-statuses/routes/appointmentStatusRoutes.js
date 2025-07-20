const createRouter = require('../../shared/utils/routerFactory');
const appointmentStatusController = require('../controllers/appointmentStatusController');

const routes = [
    // Crear estado de cita
    { method: 'post', path: '/', handler: appointmentStatusController.createAppointmentStatus },
    
    // Búsqueda y listado
    { method: 'get', path: '/search', handler: appointmentStatusController.searchAppointmentStatuses },
    { method: 'get', path: '/active', handler: appointmentStatusController.getActiveStatuses },
    { method: 'get', path: '/all', handler: appointmentStatusController.getAllStatuses },
    { method: 'get', path: '/paginated', handler: appointmentStatusController.getStatusesWithPagination },
    
    // Por categoría
    { method: 'get', path: '/category/:category', handler: appointmentStatusController.getStatusesByCategory },
    
    // Estadísticas
    { method: 'get', path: '/stats', handler: appointmentStatusController.getStatusStats },
    
    // Verificaciones
    { method: 'get', path: '/check-name/:name', handler: appointmentStatusController.checkNameAvailability },
    
    // Operaciones por ID
    { method: 'get', path: '/:id', handler: appointmentStatusController.getAppointmentStatusById },
    { method: 'put', path: '/:id', handler: appointmentStatusController.updateAppointmentStatus },
    { method: 'delete', path: '/:id', handler: appointmentStatusController.deactivateAppointmentStatus },
    { method: 'patch', path: '/:id/activate', handler: appointmentStatusController.activateAppointmentStatus },
    
    // Configuraciones especiales
    { method: 'patch', path: '/:id/set-default', handler: appointmentStatusController.setAsDefault },
];

module.exports = createRouter(routes);