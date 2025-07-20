const createRouter = require('../../shared/utils/routerFactory');
const appointmentController = require('../controllers/appointmentController');

const routes = [
    // Crear cita
    { method: 'post', path: '/', handler: appointmentController.createAppointment },
    
    // Búsqueda y listado
    { method: 'get', path: '/search', handler: appointmentController.searchAppointments },
    { method: 'get', path: '/paginated', handler: appointmentController.getAppointmentsWithPagination },
    { method: 'get', path: '/upcoming', handler: appointmentController.getUpcomingAppointments },
    { method: 'get', path: '/today', handler: appointmentController.getTodayAppointments },
    
    // Disponibilidad y slots
    { method: 'get', path: '/available-slots', handler: appointmentController.getAvailableSlots },
    { method: 'get', path: '/check-availability', handler: appointmentController.checkAvailability },
    
    // Estadísticas y reportes
    { method: 'get', path: '/stats', handler: appointmentController.getAppointmentStats },
    
    // Utilidades
    { method: 'post', path: '/process-reminders', handler: appointmentController.processReminders },
    
    // Operaciones por ID
    { method: 'get', path: '/:id', handler: appointmentController.getAppointmentById },
    { method: 'put', path: '/:id', handler: appointmentController.updateAppointment },
    { method: 'delete', path: '/:id', handler: appointmentController.deleteAppointment },
    
    // Acciones específicas de cita
    { method: 'patch', path: '/:id/cancel', handler: appointmentController.cancelAppointment },
    { method: 'patch', path: '/:id/confirm', handler: appointmentController.confirmAppointment },
    { method: 'patch', path: '/:id/complete', handler: appointmentController.completeAppointment },
    { method: 'patch', path: '/:id/reschedule', handler: appointmentController.rescheduleAppointment },
    { method: 'patch', path: '/:id/no-show', handler: appointmentController.markAsNoShow },
    { method: 'patch', path: '/:id/status', handler: appointmentController.changeAppointmentStatus },
    
    // Reportes
    { method: 'get', path: '/:id/report', handler: appointmentController.generateAppointmentReport },
    
    // Búsquedas específicas
    { method: 'get', path: '/patient/:patientId', handler: appointmentController.getAppointmentsByPatient },
    { method: 'get', path: '/doctor/:doctorId', handler: appointmentController.getAppointmentsByDoctor },
    { method: 'get', path: '/date/:date', handler: appointmentController.getAppointmentsByDate },
];

module.exports = createRouter(routes);