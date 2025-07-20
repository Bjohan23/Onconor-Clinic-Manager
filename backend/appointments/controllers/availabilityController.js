const availabilityService = require('../services/availabilityService');
const { apiResponse } = require('../../shared/helpers/apiResponseHelper');

class AvailabilityController {
    
    // Verificar disponibilidad de un médico en una fecha específica
    async checkDoctorAvailability(req, res) {
        try {
            const { doctorId } = req.params;
            const { date, startTime, endTime } = req.query;

            if (!date || !startTime) {
                return apiResponse.badRequest(res, 'Fecha y hora de inicio son requeridas');
            }

            const availability = await availabilityService.checkDoctorAvailability(
                parseInt(doctorId),
                date,
                startTime,
                endTime
            );

            return apiResponse.success(res, 'Disponibilidad verificada exitosamente', { 
                availability 
            });

        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            return apiResponse.error(res, error.message);
        }
    }

    // Obtener slots de tiempo disponibles para un médico en una fecha
    async getAvailableTimeSlots(req, res) {
        try {
            const { doctorId } = req.params;
            const { date, duration = 30 } = req.query; // duración por defecto 30 minutos

            if (!date) {
                return apiResponse.badRequest(res, 'Fecha es requerida');
            }

            const timeSlots = await availabilityService.getAvailableTimeSlots(
                parseInt(doctorId),
                date,
                parseInt(duration)
            );

            return apiResponse.success(res, 'Slots disponibles obtenidos exitosamente', { 
                timeSlots,
                count: timeSlots.length,
                date,
                duration: parseInt(duration)
            });

        } catch (error) {
            console.error('Error al obtener slots disponibles:', error);
            return apiResponse.error(res, error.message);
        }
    }

    // Obtener disponibilidad semanal de un médico
    async getWeeklyAvailability(req, res) {
        try {
            const { doctorId } = req.params;
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return apiResponse.badRequest(res, 'Fecha de inicio y fin son requeridas');
            }

            const weeklyAvailability = await availabilityService.getWeeklyAvailability(
                parseInt(doctorId),
                startDate,
                endDate
            );

            return apiResponse.success(res, 'Disponibilidad semanal obtenida exitosamente', { 
                weeklyAvailability,
                period: { startDate, endDate }
            });

        } catch (error) {
            console.error('Error al obtener disponibilidad semanal:', error);
            return apiResponse.error(res, error.message);
        }
    }

    // Obtener disponibilidad por especialidad
    async getAvailabilityBySpecialty(req, res) {
        try {
            const { specialtyId } = req.params;
            const { date, startTime, endTime } = req.query;

            if (!date) {
                return apiResponse.badRequest(res, 'Fecha es requerida');
            }

            const availability = await availabilityService.getAvailabilityBySpecialty(
                parseInt(specialtyId),
                date,
                startTime,
                endTime
            );

            return apiResponse.success(res, 'Disponibilidad por especialidad obtenida exitosamente', { 
                availability 
            });

        } catch (error) {
            console.error('Error al obtener disponibilidad por especialidad:', error);
            return apiResponse.error(res, error.message);
        }
    }

    // Reservar temporalmente un slot (para evitar doble reserva)
    async reserveTimeSlot(req, res) {
        try {
            const { doctorId } = req.params;
            const { date, startTime, endTime, patientId } = req.body;

            if (!date || !startTime || !endTime || !patientId) {
                return apiResponse.badRequest(res, 'Todos los campos son requeridos');
            }

            const reservation = await availabilityService.reserveTimeSlot(
                parseInt(doctorId),
                {
                    date,
                    startTime,
                    endTime,
                    patientId: parseInt(patientId)
                }
            );

            return apiResponse.success(res, 'Slot reservado temporalmente', { 
                reservation 
            });

        } catch (error) {
            console.error('Error al reservar slot:', error);
            return apiResponse.error(res, error.message);
        }
    }

    // Liberar reserva temporal de un slot
    async releaseTimeSlot(req, res) {
        try {
            const { reservationId } = req.params;

            const released = await availabilityService.releaseTimeSlot(reservationId);

            if (!released) {
                return apiResponse.notFound(res, 'Reserva no encontrada');
            }

            return apiResponse.success(res, 'Slot liberado exitosamente');

        } catch (error) {
            console.error('Error al liberar slot:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener próximos slots disponibles
    async getNextAvailableSlots(req, res) {
        try {
            const { doctorId } = req.params;
            const { limit = 10, duration = 30 } = req.query;

            const nextSlots = await availabilityService.getNextAvailableSlots(
                parseInt(doctorId),
                parseInt(limit),
                parseInt(duration)
            );

            return apiResponse.success(res, 'Próximos slots disponibles obtenidos exitosamente', { 
                nextSlots,
                count: nextSlots.length
            });

        } catch (error) {
            console.error('Error al obtener próximos slots:', error);
            return apiResponse.error(res, error.message);
        }
    }

    // Verificar conflictos de horarios para una nueva cita
    async checkAppointmentConflicts(req, res) {
        try {
            const { doctorId, patientId, date, startTime, endTime } = req.body;

            if (!doctorId || !patientId || !date || !startTime || !endTime) {
                return apiResponse.badRequest(res, 'Todos los campos son requeridos');
            }

            const conflicts = await availabilityService.checkAppointmentConflicts({
                doctorId: parseInt(doctorId),
                patientId: parseInt(patientId),
                date,
                startTime,
                endTime
            });

            return apiResponse.success(res, 'Verificación de conflictos completada', { 
                hasConflicts: conflicts.length > 0,
                conflicts 
            });

        } catch (error) {
            console.error('Error al verificar conflictos:', error);
            return apiResponse.error(res, error.message);
        }
    }

    // Obtener estadísticas de disponibilidad
    async getAvailabilityStats(req, res) {
        try {
            const { doctorId } = req.params;
            const { startDate, endDate } = req.query;

            const stats = await availabilityService.getAvailabilityStats(
                parseInt(doctorId),
                startDate,
                endDate
            );

            return apiResponse.success(res, 'Estadísticas de disponibilidad obtenidas exitosamente', { 
                stats 
            });

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return apiResponse.error(res, error.message);
        }
    }
}

module.exports = new AvailabilityController();