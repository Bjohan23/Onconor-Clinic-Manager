const scheduleRepository = require('../repositories/scheduleRepository');
const scheduleService = require('../services/scheduleService');
const { apiResponse } = require('../../shared/helpers/apiResponseHelper');

class ScheduleController {
    
    // Crear nuevo horario
    async createSchedule(req, res) {
        try {
            const scheduleData = req.body;

            // Agregar información de auditoría
            scheduleData.user_created = req.user.userId;

            const schedule = await scheduleService.createScheduleWithValidation(
                scheduleData, 
                req.user.userId
            );

            return apiResponse.success(res, 'Horario creado exitosamente', { schedule });

        } catch (error) {
            console.error('Error al crear horario:', error);
            
            if (error.message.includes('validación') || 
                error.message.includes('no existe') || 
                error.message.includes('se superpone')) {
                return apiResponse.badRequest(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener horario por ID
    async getScheduleById(req, res) {
        try {
            const { id } = req.params;

            const schedule = await scheduleRepository.findById(id);
            if (!schedule) {
                return apiResponse.notFound(res, 'Horario no encontrado');
            }

            return apiResponse.success(res, 'Horario obtenido exitosamente', { schedule });

        } catch (error) {
            console.error('Error al obtener horario:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener horarios por doctor
    async getSchedulesByDoctor(req, res) {
        try {
            const { doctorId } = req.params;
            const filters = {
                dayOfWeek: req.query.dayOfWeek !== undefined ? parseInt(req.query.dayOfWeek) : undefined,
                isAvailable: req.query.isAvailable !== undefined ? req.query.isAvailable === 'true' : undefined,
                scheduleType: req.query.scheduleType,
                validDate: req.query.validDate
            };

            const result = await scheduleService.getDoctorSchedulesWithAnalysis(doctorId, filters);

            return apiResponse.success(res, 'Horarios obtenidos exitosamente', result);

        } catch (error) {
            console.error('Error al obtener horarios por doctor:', error);
            
            if (error.message.includes('no encontrado')) {
                return apiResponse.notFound(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Actualizar horario
    async updateSchedule(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // No permitir actualizar ciertos campos sensibles
            delete updateData.id;
            delete updateData.doctorId; // No permitir cambiar doctor
            delete updateData.created_at;
            delete updateData.updated_at;
            delete updateData.flg_deleted;
            delete updateData.deleted_at;

            const updatedSchedule = await scheduleService.updateScheduleWithValidation(
                id, 
                updateData, 
                req.user.userId
            );

            return apiResponse.success(res, 'Horario actualizado exitosamente', { 
                schedule: updatedSchedule 
            });

        } catch (error) {
            console.error('Error al actualizar horario:', error);
            
            if (error.message.includes('no encontrado') || 
                error.message.includes('se superpone')) {
                return apiResponse.badRequest(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Cambiar disponibilidad del horario
    async toggleScheduleAvailability(req, res) {
        try {
            const { id } = req.params;
            const { isAvailable } = req.body;

            if (typeof isAvailable !== 'boolean') {
                return apiResponse.badRequest(res, 'El campo isAvailable debe ser true o false');
            }

            const updatedSchedule = await scheduleService.toggleScheduleAvailability(
                id, 
                isAvailable, 
                req.user.userId
            );

            return apiResponse.success(res, 
                `Horario ${isAvailable ? 'activado' : 'desactivado'} exitosamente`, 
                { schedule: updatedSchedule }
            );

        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
            
            if (error.message.includes('no encontrado')) {
                return apiResponse.notFound(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Eliminar horario (soft delete)
    async deleteSchedule(req, res) {
        try {
            const { id } = req.params;

            // Validar antes de eliminar
            const validation = await scheduleService.validateScheduleDeletion(id);
            
            if (!validation.canDelete) {
                return apiResponse.badRequest(res, 'No se puede eliminar el horario');
            }

            const deleted = await scheduleRepository.deleteSchedule(id, req.user.userId);

            if (!deleted) {
                return apiResponse.error(res, 'Error al eliminar horario');
            }

            return apiResponse.success(res, 'Horario eliminado exitosamente', {
                warnings: validation.warnings
            });

        } catch (error) {
            console.error('Error al eliminar horario:', error);
            
            if (error.message.includes('no encontrado')) {
                return apiResponse.notFound(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Buscar horarios con filtros y paginación
    async searchSchedules(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                doctorId: req.query.doctorId,
                dayOfWeek: req.query.dayOfWeek !== undefined ? parseInt(req.query.dayOfWeek) : undefined,
                isAvailable: req.query.isAvailable !== undefined ? req.query.isAvailable === 'true' : undefined,
                scheduleType: req.query.scheduleType
            };

            const result = await scheduleRepository.findWithPagination(page, limit, filters);

            return apiResponse.success(res, 'Búsqueda completada exitosamente', result);

        } catch (error) {
            console.error('Error en búsqueda de horarios:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Crear horario semanal completo
    async createWeeklySchedule(req, res) {
        try {
            const { doctorId, weeklySchedule } = req.body;

            if (!doctorId || !Array.isArray(weeklySchedule)) {
                return apiResponse.badRequest(res, 'Doctor ID y horarios semanales son requeridos');
            }

            const result = await scheduleService.createWeeklySchedule(
                doctorId, 
                weeklySchedule, 
                req.user.userId
            );

            if (result.errors.length > 0) {
                return apiResponse.success(res, 'Horario semanal creado con algunos errores', result);
            }

            return apiResponse.success(res, 'Horario semanal creado exitosamente', result);

        } catch (error) {
            console.error('Error al crear horario semanal:', error);
            
            if (error.message.includes('no encontrado')) {
                return apiResponse.notFound(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Clonar horario a múltiples días
    async cloneSchedule(req, res) {
        try {
            const { id } = req.params;
            const { targetDays } = req.body;

            if (!Array.isArray(targetDays) || targetDays.length === 0) {
                return apiResponse.badRequest(res, 'Días objetivo son requeridos como array');
            }

            // Validar días de la semana
            const validDays = targetDays.every(day => 
                Number.isInteger(day) && day >= 0 && day <= 6
            );

            if (!validDays) {
                return apiResponse.badRequest(res, 'Los días deben ser números entre 0 (Domingo) y 6 (Sábado)');
            }

            const result = await scheduleService.cloneScheduleToMultipleDays(
                id, 
                targetDays, 
                req.user.userId
            );

            return apiResponse.success(res, 'Horario clonado exitosamente', result);

        } catch (error) {
            console.error('Error al clonar horario:', error);
            
            if (error.message.includes('no encontrado')) {
                return apiResponse.notFound(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener resumen semanal de horarios
    async getWeeklyScheduleSummary(req, res) {
        try {
            const { doctorId } = req.params;
            const { weekStartDate } = req.query;

            const result = await scheduleService.getWeeklyScheduleSummaryWithAnalysis(
                doctorId, 
                weekStartDate
            );

            return apiResponse.success(res, 'Resumen semanal obtenido exitosamente', result);

        } catch (error) {
            console.error('Error al obtener resumen semanal:', error);
            
            if (error.message.includes('no encontrado')) {
                return apiResponse.notFound(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Buscar médicos disponibles
    async findAvailableDoctors(req, res) {
        try {
            const { dayOfWeek, time, date, specialtyId } = req.query;

            if (dayOfWeek === undefined || !time) {
                return apiResponse.badRequest(res, 'Día de la semana y hora son requeridos');
            }

            const dayOfWeekInt = parseInt(dayOfWeek);
            if (dayOfWeekInt < 0 || dayOfWeekInt > 6) {
                return apiResponse.badRequest(res, 'Día de la semana debe ser entre 0 (Domingo) y 6 (Sábado)');
            }

            const result = await scheduleService.findAvailableDoctorsWithAnalysis(
                dayOfWeekInt, 
                time, 
                date, 
                specialtyId
            );

            return apiResponse.success(res, 'Médicos disponibles obtenidos exitosamente', result);

        } catch (error) {
            console.error('Error al buscar médicos disponibles:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener estadísticas de horarios
    async getScheduleStats(req, res) {
        try {
            const filters = {
                doctorId: req.query.doctorId
            };

            const stats = await scheduleService.getEnhancedScheduleStats(filters);

            return apiResponse.success(res, 'Estadísticas obtenidas exitosamente', { stats });

        } catch (error) {
            console.error('Error al obtener estadísticas de horarios:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Verificar conflictos de horarios
    async checkScheduleConflict(req, res) {
        try {
            const { doctorId, dayOfWeek, startTime, endTime, validFrom, validTo } = req.query;
            const excludeId = req.query.excludeId || null;

            if (!doctorId || dayOfWeek === undefined || !startTime || !endTime) {
                return apiResponse.badRequest(res, 
                    'Doctor ID, día de la semana, hora de inicio y fin son requeridos');
            }

            const hasConflict = await scheduleRepository.checkScheduleConflict(
                parseInt(doctorId),
                parseInt(dayOfWeek),
                startTime,
                endTime,
                excludeId,
                validFrom,
                validTo
            );

            return apiResponse.success(res, 'Verificación de conflictos completada', {
                doctorId: parseInt(doctorId),
                dayOfWeek: parseInt(dayOfWeek),
                startTime,
                endTime,
                hasConflict,
                available: !hasConflict
            });

        } catch (error) {
            console.error('Error al verificar conflictos:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener horarios por día de la semana
    async getSchedulesByDayOfWeek(req, res) {
        try {
            const { dayOfWeek } = req.params;
            const { specialtyId, date } = req.query;

            const dayOfWeekInt = parseInt(dayOfWeek);
            if (dayOfWeekInt < 0 || dayOfWeekInt > 6) {
                return apiResponse.badRequest(res, 'Día de la semana debe ser entre 0 (Domingo) y 6 (Sábado)');
            }

            const schedules = await scheduleRepository.findAll({
                dayOfWeek: dayOfWeekInt,
                isAvailable: true,
                active: true
            });

            // Filtrar por especialidad si se especifica
            let filteredSchedules = schedules;
            if (specialtyId) {
                filteredSchedules = schedules.filter(schedule => 
                    schedule.doctor && 
                    schedule.doctor.specialty && 
                    schedule.doctor.specialty.id === parseInt(specialtyId)
                );
            }

            const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

            return apiResponse.success(res, 'Horarios obtenidos exitosamente', {
                dayOfWeek: dayOfWeekInt,
                dayName: dayNames[dayOfWeekInt],
                schedules: filteredSchedules,
                total: filteredSchedules.length,
                filters: { specialtyId, date }
            });

        } catch (error) {
            console.error('Error al obtener horarios por día:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Generar reporte de horario
    async generateScheduleReport(req, res) {
        try {
            const { id } = req.params;

            const report = await scheduleService.generateScheduleReport(id);

            return apiResponse.success(res, 'Reporte generado exitosamente', { report });

        } catch (error) {
            console.error('Error al generar reporte:', error);
            
            if (error.message.includes('no encontrado')) {
                return apiResponse.notFound(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener horarios activos por doctor
    async getActiveDoctorSchedules(req, res) {
        try {
            const { doctorId } = req.params;

            const schedules = await scheduleRepository.findActiveByDoctor(doctorId);

            const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            
            // Organizar por día de la semana
            const organizedSchedules = {};
            for (let i = 0; i < 7; i++) {
                organizedSchedules[i] = {
                    dayName: dayNames[i],
                    schedules: schedules.filter(s => s.dayOfWeek === i)
                };
            }

            return apiResponse.success(res, 'Horarios activos obtenidos exitosamente', {
                doctorId,
                schedules,
                organizedSchedules,
                total: schedules.length
            });

        } catch (error) {
            console.error('Error al obtener horarios activos:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }
}

module.exports = new ScheduleController();