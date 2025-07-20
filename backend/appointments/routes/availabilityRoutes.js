const createRouter = require('../../shared/utils/routerFactory');
const availabilityController = require('../controllers/availabilityController');

const routes = [
    // Verificar disponibilidad de médico
    { method: 'get', path: '/doctor/:doctorId/check', handler: availabilityController.checkDoctorAvailability },
    
    // Obtener slots disponibles
    { method: 'get', path: '/doctor/:doctorId/slots', handler: availabilityController.getAvailableTimeSlots },
    
    // Disponibilidad semanal
    { method: 'get', path: '/doctor/:doctorId/weekly', handler: availabilityController.getWeeklyAvailability },
    
    // Disponibilidad por especialidad
    { method: 'get', path: '/specialty/:specialtyId', handler: availabilityController.getAvailabilityBySpecialty },
    
    // Próximos slots disponibles
    { method: 'get', path: '/doctor/:doctorId/next-slots', handler: availabilityController.getNextAvailableSlots },
    
    // Reservas temporales
    { method: 'post', path: '/doctor/:doctorId/reserve', handler: availabilityController.reserveTimeSlot },
    { method: 'delete', path: '/reservation/:reservationId', handler: availabilityController.releaseTimeSlot },
    
    // Verificar conflictos
    { method: 'post', path: '/check-conflicts', handler: availabilityController.checkAppointmentConflicts },
    
    // Estadísticas
    { method: 'get', path: '/doctor/:doctorId/stats', handler: availabilityController.getAvailabilityStats }
];

module.exports = createRouter(routes);