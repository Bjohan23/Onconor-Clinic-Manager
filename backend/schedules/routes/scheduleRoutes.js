const createRouter = require('../../shared/utils/routerFactory');
const scheduleController = require('../controllers/scheduleController');

const routes = [
    // Crear horario
    { method: 'post', path: '/', handler: scheduleController.createSchedule },
    
    // Crear horario semanal
    { method: 'post', path: '/weekly', handler: scheduleController.createWeeklySchedule },
    
    // Búsqueda y listado
    { method: 'get', path: '/search', handler: scheduleController.searchSchedules },
    { method: 'get', path: '/available-doctors', handler: scheduleController.findAvailableDoctors },
    
    // Verificaciones
    { method: 'get', path: '/check-conflict', handler: scheduleController.checkScheduleConflict },
    
    // Estadísticas y reportes
    { method: 'get', path: '/stats', handler: scheduleController.getScheduleStats },
    
    // Operaciones por ID
    { method: 'get', path: '/:id', handler: scheduleController.getScheduleById },
    { method: 'put', path: '/:id', handler: scheduleController.updateSchedule },
    { method: 'delete', path: '/:id', handler: scheduleController.deleteSchedule },
    
    // Acciones específicas
    { method: 'patch', path: '/:id/toggle-availability', handler: scheduleController.toggleScheduleAvailability },
    { method: 'post', path: '/:id/clone', handler: scheduleController.cloneSchedule },
    
    // Reportes
    { method: 'get', path: '/:id/report', handler: scheduleController.generateScheduleReport },
    
    // Búsquedas específicas
    { method: 'get', path: '/doctor/:doctorId', handler: scheduleController.getSchedulesByDoctor },
    { method: 'get', path: '/doctor/:doctorId/active', handler: scheduleController.getActiveDoctorSchedules },
    { method: 'get', path: '/doctor/:doctorId/weekly', handler: scheduleController.getWeeklyScheduleSummary },
    { method: 'get', path: '/day/:dayOfWeek', handler: scheduleController.getSchedulesByDayOfWeek },
];

module.exports = createRouter(routes);