const scheduleRepository = require('../repositories/scheduleRepository');
const doctorRepository = require('../../doctors/repositories/doctorRepository');

class ScheduleService {

    async createScheduleWithValidation(scheduleData, userId) {
        try {
            // Validar que el médico existe
            const doctor = await doctorRepository.findById(scheduleData.doctorId);
            if (!doctor) {
                throw new Error('Médico no encontrado');
            }

            // Validar horarios
            this.validateScheduleTimes(scheduleData);

            // Verificar que no exista conflicto de horarios
            await this.checkScheduleConflicts(scheduleData);

            // Crear horario
            const scheduleWithUser = {
                ...scheduleData,
                user_created: userId
            };

            return await scheduleRepository.create(scheduleWithUser);

        } catch (error) {
            throw new Error(`Error al crear horario: ${error.message}`);
        }
    }

    async updateScheduleWithValidation(scheduleId, updateData, userId) {
        try {
            // Verificar que el horario existe
            const existingSchedule = await scheduleRepository.findById(scheduleId);
            if (!existingSchedule) {
                throw new Error('Horario no encontrado');
            }

            // Validar nuevos horarios si se están actualizando
            if (updateData.startTime || updateData.endTime) {
                const scheduleToValidate = {
                    ...existingSchedule.dataValues,
                    ...updateData
                };
                this.validateScheduleTimes(scheduleToValidate);
                
                // Verificar conflictos excluyendo el horario actual
                await this.checkScheduleConflicts(scheduleToValidate, scheduleId);
            }

            const updateWithUser = {
                ...updateData,
                user_updated: userId
            };

            return await scheduleRepository.update(scheduleId, updateWithUser);

        } catch (error) {
            throw new Error(`Error al actualizar horario: ${error.message}`);
        }
    }

    async deleteSchedule(scheduleId, userId) {
        try {
            // Verificar que el horario existe
            const schedule = await scheduleRepository.findById(scheduleId);
            if (!schedule) {
                return false;
            }

            return await scheduleRepository.softDelete(scheduleId, userId);

        } catch (error) {
            throw new Error(`Error al eliminar horario: ${error.message}`);
        }
    }

    async getAvailabilityByDay(doctorId, dayOfWeek) {
        try {
            // Validar que el médico existe
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Médico no encontrado');
            }

            // Obtener horarios del día específico
            const schedules = await scheduleRepository.findByFilters({
                doctorId,
                dayOfWeek,
                isAvailable: true,
                active: true
            });

            return {
                doctorId,
                dayOfWeek,
                schedules: schedules.map(schedule => ({
                    id: schedule.id,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    breakStart: schedule.breakStart,
                    breakEnd: schedule.breakEnd
                }))
            };

        } catch (error) {
            throw new Error(`Error al obtener disponibilidad: ${error.message}`);
        }
    }

    async createWeeklySchedule(doctorId, weeklyScheduleData, userId) {
        try {
            // Validar que el médico existe
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Médico no encontrado');
            }

            const createdSchedules = [];

            for (const daySchedule of weeklyScheduleData) {
                const scheduleData = {
                    doctorId,
                    dayOfWeek: daySchedule.dayOfWeek,
                    startTime: daySchedule.startTime,
                    endTime: daySchedule.endTime,
                    isAvailable: daySchedule.isAvailable !== false,
                    breakStart: daySchedule.breakStart,
                    breakEnd: daySchedule.breakEnd,
                    user_created: userId
                };

                // Validar horarios
                this.validateScheduleTimes(scheduleData);

                // Verificar conflictos
                await this.checkScheduleConflicts(scheduleData);

                const schedule = await scheduleRepository.create(scheduleData);
                createdSchedules.push(schedule);
            }

            return createdSchedules;

        } catch (error) {
            throw new Error(`Error al crear horarios semanales: ${error.message}`);
        }
    }

    async toggleAvailability(scheduleId, isAvailable, userId) {
        try {
            const updateData = {
                isAvailable,
                user_updated: userId
            };

            return await scheduleRepository.update(scheduleId, updateData);

        } catch (error) {
            throw new Error(`Error al cambiar disponibilidad: ${error.message}`);
        }
    }

    // Métodos de validación privados
    validateScheduleTimes(scheduleData) {
        const { startTime, endTime, breakStart, breakEnd } = scheduleData;

        // Validar que hora fin sea después de hora inicio
        if (startTime >= endTime) {
            throw new Error('La hora de fin debe ser posterior a la hora de inicio');
        }

        // Validar descansos si existen
        if (breakStart && breakEnd) {
            if (breakStart >= breakEnd) {
                throw new Error('La hora de fin del descanso debe ser posterior a la hora de inicio');
            }

            if (breakStart < startTime || breakEnd > endTime) {
                throw new Error('Los horarios de descanso deben estar dentro del horario laboral');
            }
        }

        // Validar formato de tiempo (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            throw new Error('Formato de tiempo inválido. Usar HH:MM');
        }

        if (breakStart && !timeRegex.test(breakStart)) {
            throw new Error('Formato de tiempo de inicio de descanso inválido');
        }

        if (breakEnd && !timeRegex.test(breakEnd)) {
            throw new Error('Formato de tiempo de fin de descanso inválido');
        }
    }

    async checkScheduleConflicts(scheduleData, excludeScheduleId = null) {
        const { doctorId, dayOfWeek, startTime, endTime } = scheduleData;

        const existingSchedules = await scheduleRepository.findByFilters({
            doctorId,
            dayOfWeek,
            active: true
        });

        // Filtrar el horario actual si se está actualizando
        const schedulesToCheck = excludeScheduleId 
            ? existingSchedules.filter(s => s.id !== excludeScheduleId)
            : existingSchedules;

        for (const existing of schedulesToCheck) {
            // Verificar solapamiento
            if (this.timesOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
                throw new Error(`Conflicto de horarios: Ya existe un horario para este médico el mismo día de ${existing.startTime} a ${existing.endTime}`);
            }
        }
    }

    timesOverlap(start1, end1, start2, end2) {
        return start1 < end2 && end1 > start2;
    }

    // Método para obtener horarios disponibles en un rango de fechas
    async getSchedulesByDateRange(doctorId, startDate, endDate) {
        try {
            const schedules = await scheduleRepository.findByDateRange(doctorId, startDate, endDate);
            return schedules;
        } catch (error) {
            throw new Error(`Error al obtener horarios por rango de fechas: ${error.message}`);
        }
    }
}

module.exports = new ScheduleService();