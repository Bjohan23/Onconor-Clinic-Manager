const scheduleService = require('../services/scheduleService');
const scheduleRepository = require('../repositories/scheduleRepository');
const { apiResponse } = require('../../shared/helpers/apiResponseHelper');

class ScheduleController {
    
    // Crear nuevo horario
    async createSchedule(req, res) {
        try {
            const scheduleData = req.body;

            const schedule = await scheduleService.createScheduleWithValidation(
                scheduleData, 
                req.user.userId
            );

            return apiResponse.success(res, 'Horario creado exitosamente', { schedule });

        } catch (error) {
            console.error('Error al crear horario:', error);
            return apiResponse.error(res, error.message);
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

    // Obtener horarios de un médico
    async getSchedulesByDoctor(req, res) {
        try {
            const { doctorId } = req.params;
            const { dayOfWeek, isAvailable } = req.query;

            const filters = {
                doctorId,
                ...(dayOfWeek && { dayOfWeek: parseInt(dayOfWeek) }),
                ...(isAvailable !== undefined && { isAvailable: isAvailable === 'true' })
            };

            const schedules = await scheduleRepository.findByFilters(filters);

            return apiResponse.success(res, 'Horarios obtenidos exitosamente', { 
                schedules,
                count: schedules.length 
            });

        } catch (error) {
            console.error('Error al obtener horarios:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener todos los horarios con filtros
    async getAllSchedules(req, res) {
        try {
            const { page = 1, limit = 10, doctorId, dayOfWeek, isAvailable } = req.query;

            const filters = {
                ...(doctorId && { doctorId }),
                ...(dayOfWeek && { dayOfWeek: parseInt(dayOfWeek) }),
                ...(isAvailable !== undefined && { isAvailable: isAvailable === 'true' })
            };

            const result = await scheduleRepository.findAllWithPagination(
                filters, 
                parseInt(page), 
                parseInt(limit)
            );

            return apiResponse.success(res, 'Horarios obtenidos exitosamente', result);

        } catch (error) {
            console.error('Error al obtener horarios:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Actualizar horario
    async updateSchedule(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updatedSchedule = await scheduleService.updateScheduleWithValidation(
                id, 
                updateData, 
                req.user.userId
            );

            if (!updatedSchedule) {
                return apiResponse.notFound(res, 'Horario no encontrado');
            }

            return apiResponse.success(res, 'Horario actualizado exitosamente', { 
                schedule: updatedSchedule 
            });

        } catch (error) {
            console.error('Error al actualizar horario:', error);
            return apiResponse.error(res, error.message);
        }
    }

    // Eliminar horario (soft delete)
    async deleteSchedule(req, res) {
        try {
            const { id } = req.params;

            const deleted = await scheduleService.deleteSchedule(id, req.user.userId);

            if (!deleted) {
                return apiResponse.notFound(res, 'Horario no encontrado');
            }

            return apiResponse.success(res, 'Horario eliminado exitosamente');

        } catch (error) {
            console.error('Error al eliminar horario:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener disponibilidad de horarios por día de la semana
    async getAvailabilityByDay(req, res) {
        try {
            const { doctorId, dayOfWeek } = req.params;

            const availability = await scheduleService.getAvailabilityByDay(
                parseInt(doctorId), 
                parseInt(dayOfWeek)
            );

            return apiResponse.success(res, 'Disponibilidad obtenida exitosamente', { 
                availability 
            });

        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Crear horarios para toda la semana
    async createWeeklySchedule(req, res) {
        try {
            const { doctorId } = req.params;
            const { weeklySchedule } = req.body; // Array de horarios para cada día

            const schedules = await scheduleService.createWeeklySchedule(
                doctorId, 
                weeklySchedule, 
                req.user.userId
            );

            return apiResponse.success(res, 'Horarios semanales creados exitosamente', { 
                schedules,
                count: schedules.length 
            });

        } catch (error) {
            console.error('Error al crear horarios semanales:', error);
            return apiResponse.error(res, error.message);
        }
    }

    // Activar/Desactivar horario
    async toggleScheduleAvailability(req, res) {
        try {
            const { id } = req.params;
            const { isAvailable } = req.body;

            const updatedSchedule = await scheduleService.toggleAvailability(
                id, 
                isAvailable, 
                req.user.userId
            );

            if (!updatedSchedule) {
                return apiResponse.notFound(res, 'Horario no encontrado');
            }

            const message = isAvailable ? 'Horario activado' : 'Horario desactivado';
            
            return apiResponse.success(res, `${message} exitosamente`, { 
                schedule: updatedSchedule 
            });

        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }
}

module.exports = new ScheduleController();