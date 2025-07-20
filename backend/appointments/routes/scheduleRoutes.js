const createRouter = require('../../shared/utils/routerFactory');
const scheduleController = require('../controllers/scheduleController');

const routes = [
    // Crear horario
    { method: 'post', path: '/', handler: scheduleController.createSchedule },
    
    // Búsqueda y listado
    { method: 'get', path: '/', handler: scheduleController.getAllSchedules },
    
    // Por médico
    { method: 'get', path: '/doctor/:doctorId', handler: scheduleController.getSchedulesByDoctor },
    
    // Disponibilidad
    { method: 'get', path: '/availability/:doctorId/:dayOfWeek', handler: scheduleController.getAvailabilityByDay },
    
    // Horarios semanales
    { method: 'post', path: '/weekly/:doctorId', handler: scheduleController.createWeeklySchedule },
    
    // Operaciones por ID
    { method: 'get', path: '/:id', handler: scheduleController.getScheduleById },
    { method: 'put', path: '/:id', handler: scheduleController.updateSchedule },
    { method: 'delete', path: '/:id', handler: scheduleController.deleteSchedule },
    
    // Cambiar disponibilidad
    { method: 'patch', path: '/:id/toggle-availability', handler: scheduleController.toggleScheduleAvailability }
];

module.exports = createRouter(routes);