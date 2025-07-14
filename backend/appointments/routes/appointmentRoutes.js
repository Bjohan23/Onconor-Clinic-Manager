const createRouter = require('../../shared/utils/routerFactory');
const appointmentController = require('../controllers/appointmentController');

const routes = [
    // Crear cita
    { method: 'post', path: '/', handler: appointmentController.createAppointment },
    
    // Búsqueda y listado
    { method: 'get', path: '/search', handler: appointmentController.searchAppointments },
    { method: 'get', path: '/', handler: appointmentController.getAppointments },
    { method: 'get', path: '/today', handler: appointmentController.getTodaysAppointments },
    { method: 'get', path: '/upcoming', handler: appointmentController.getUpcomingAppointments },
    
    // Por paciente y médico
    { method: 'get', path: '/patient/:patientId', handler: appointmentController.getAppointmentsByPatient },
    { method: 'get', path: '/doctor/:doctorId', handler: appointmentController.getAppointmentsByDoctor },
    
    // Verificaciones
    { method: 'get', path: '/check-availability', handler: appointmentController.checkAvailability },
    
    // Estadísticas
    { method: 'get', path: '/stats', handler: appointmentController.getAppointmentStats },
    
    // Operaciones por ID
    { method: 'get', path: '/:id', handler: appointmentController.getAppointmentById },
    { method: 'put', path: '/:id', handler: appointmentController.updateAppointment },
    
    // Cambios de estado
    { method: 'patch', path: '/:id/confirm', handler: appointmentController.confirmAppointment },
    { method: 'patch', path: '/:id/cancel', handler: appointmentController.cancelAppointment },
    { method: 'patch', path: '/:id/complete', handler: appointmentController.completeAppointment },
    { method: 'patch', path: '/:id/start', handler: appointmentController.startAppointment },
    { method: 'patch', path: '/:id/no-show', handler: appointmentController.markAsNoShow },
    { method: 'patch', path: '/:id/reschedule', handler: appointmentController.rescheduleAppointment },
];

module.exports = createRouter(routes);