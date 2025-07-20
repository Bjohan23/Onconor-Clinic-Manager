const scheduleRepository = require('../repositories/scheduleRepository');
const doctorRepository = require('../../doctors/repositories/doctorRepository');

class ScheduleService {

    // Validar datos del horario
    validateScheduleData(scheduleData) {
        const errors = [];

        // Validar doctor
        if (!scheduleData.doctorId || !Number.isInteger(Number(scheduleData.doctorId))) {
            errors.push('El ID del doctor es obligatorio y debe ser válido');
        }

        // Validar día de la semana
        if (scheduleData.dayOfWeek === undefined || scheduleData.dayOfWeek === null) {
            errors.push('El día de la semana es obligatorio');
        } else if (!Number.isInteger(Number(scheduleData.dayOfWeek)) || scheduleData.dayOfWeek < 0 || scheduleData.dayOfWeek > 6) {
            errors.push('El día de la semana debe ser un número entre 0 (Domingo) y 6 (Sábado)');
        }

        // Validar hora de inicio
        if (!scheduleData.startTime) {
            errors.push('La hora de inicio es obligatoria');
        } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(scheduleData.startTime)) {
            errors.push('El formato de la hora de inicio no es válido (HH:MM)');
        }

        // Validar hora de fin
        if (!scheduleData.endTime) {
            errors.push('La hora de fin es obligatoria');
        } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(scheduleData.endTime)) {
            errors.push('El formato de la hora de fin no es válido (HH:MM)');
        }

        // Validar que la hora de fin sea posterior a la de inicio
        if (scheduleData.startTime && scheduleData.endTime) {
            const startMinutes = this.timeToMinutes(scheduleData.startTime);
            const endMinutes = this.timeToMinutes(scheduleData.endTime);
            
            if (endMinutes <= startMinutes) {
                errors.push('La hora de fin debe ser posterior a la hora de inicio');
            }

            // Validar duración mínima (al menos 1 hora)
            if ((endMinutes - startMinutes) < 60) {
                errors.push('El horario debe tener una duración mínima de 1 hora');
            }
        }

        // Validar horario de descanso
        if (scheduleData.breakStart && scheduleData.breakEnd) {
            if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(scheduleData.breakStart)) {
                errors.push('El formato de la hora de inicio del descanso no es válido');
            }
            if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(scheduleData.breakEnd)) {
                errors.push('El formato de la hora de fin del descanso no es válido');
            }

            if (scheduleData.startTime && scheduleData.endTime) {
                const startMinutes = this.timeToMinutes(scheduleData.startTime);
                const endMinutes = this.timeToMinutes(scheduleData.endTime);
                const breakStartMinutes = this.timeToMinutes(scheduleData.breakStart);
                const breakEndMinutes = this.timeToMinutes(scheduleData.breakEnd);

                if (breakStartMinutes < startMinutes || breakStartMinutes >= endMinutes) {
                    errors.push('La hora de inicio del descanso debe estar dentro del horario de trabajo');
                }
                if (breakEndMinutes <= startMinutes || breakEndMinutes > endMinutes) {
                    errors.push('La hora de fin del descanso debe estar dentro del horario de trabajo');
                }
                if (breakEndMinutes <= breakStartMinutes) {
                    errors.push('La hora de fin del descanso debe ser posterior a la hora de inicio');
                }
            }
        }

        // Validar duración de slot
        if (scheduleData.slotDuration && (scheduleData.slotDuration < 15 || scheduleData.slotDuration > 120)) {
            errors.push('La duración del slot debe estar entre 15 y 120 minutos');
        }

        // Validar máximo de pacientes por slot
        if (scheduleData.maxPatientsPerSlot && (scheduleData.maxPatientsPerSlot < 1 || scheduleData.maxPatientsPerSlot > 10)) {
            errors.push('El máximo de pacientes por slot debe estar entre 1 y 10');
        }

        // Validar tipo de horario
        if (scheduleData.scheduleType && !['regular', 'special', 'emergency', 'surgery'].includes(scheduleData.scheduleType)) {
            errors.push('El tipo de horario debe ser: regular, special, emergency o surgery');
        }

        // Validar fechas de validez
        if (scheduleData.validFrom && scheduleData.validTo) {
            const validFrom = new Date(scheduleData.validFrom);
            const validTo = new Date(scheduleData.validTo);
            
            if (validTo <= validFrom) {
                errors.push('La fecha de fin de validez debe ser posterior a la fecha de inicio');
            }
        }

        return errors;
    }

    // Helper para convertir tiempo a minutos
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Helper para convertir minutos a tiempo
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
    }

    // Crear horario con validaciones de negocio
    async createScheduleWithValidation(scheduleData, createdBy) {
        try {
            // Validar datos básicos
            const validationErrors = this.validateScheduleData(scheduleData);
            if (validationErrors.length > 0) {
                throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
            }

            // Verificar que el doctor existe y está activo
            const doctor = await doctorRepository.findById(scheduleData.doctorId);
            if (!doctor) {
                throw new Error('El doctor especificado no existe');
            }
            if (!doctor.active) {
                throw new Error('El doctor no está activo');
            }

            // Verificar conflictos de horarios
            const hasConflict = await scheduleRepository.checkScheduleConflict(
                scheduleData.doctorId,
                scheduleData.dayOfWeek,
                scheduleData.startTime,
                scheduleData.endTime,
                null,
                scheduleData.validFrom,
                scheduleData.validTo
            );

            if (hasConflict) {
                throw new Error('El horario se superpone con un horario existente para este doctor');
            }

            // Establecer valores por defecto
            scheduleData.isAvailable = scheduleData.isAvailable !== undefined ? scheduleData.isAvailable : true;
            scheduleData.slotDuration = scheduleData.slotDuration || 30;
            scheduleData.maxPatientsPerSlot = scheduleData.maxPatientsPerSlot || 1;
            scheduleData.scheduleType = scheduleData.scheduleType || 'regular';
            scheduleData.isRecurring = scheduleData.isRecurring !== undefined ? scheduleData.isRecurring : true;
            scheduleData.user_created = createdBy;

            // Crear el horario
            const schedule = await scheduleRepository.createSchedule(scheduleData);

            return schedule;

        } catch (error) {
            throw new Error(`Error al crear horario: ${error.message}`);
        }
    }

    // Actualizar horario con validaciones
    async updateScheduleWithValidation(scheduleId, updateData, updatedBy) {
        try {
            // Verificar que el horario existe
            const existingSchedule = await scheduleRepository.findById(scheduleId);
            if (!existingSchedule) {
                throw new Error('Horario no encontrado');
            }

            // Validar datos si se están actualizando campos críticos
            if (updateData.startTime || updateData.endTime || updateData.dayOfWeek || 
                updateData.breakStart || updateData.breakEnd) {
                
                const dataToValidate = {
                    doctorId: updateData.doctorId || existingSchedule.doctorId,
                    dayOfWeek: updateData.dayOfWeek !== undefined ? updateData.dayOfWeek : existingSchedule.dayOfWeek,
                    startTime: updateData.startTime || existingSchedule.startTime,
                    endTime: updateData.endTime || existingSchedule.endTime,
                    breakStart: updateData.breakStart !== undefined ? updateData.breakStart : existingSchedule.breakStart,
                    breakEnd: updateData.breakEnd !== undefined ? updateData.breakEnd : existingSchedule.breakEnd,
                    slotDuration: updateData.slotDuration || existingSchedule.slotDuration,
                    maxPatientsPerSlot: updateData.maxPatientsPerSlot || existingSchedule.maxPatientsPerSlot,
                    scheduleType: updateData.scheduleType || existingSchedule.scheduleType,
                    validFrom: updateData.validFrom !== undefined ? updateData.validFrom : existingSchedule.validFrom,
                    validTo: updateData.validTo !== undefined ? updateData.validTo : existingSchedule.validTo
                };

                const validationErrors = this.validateScheduleData(dataToValidate);
                if (validationErrors.length > 0) {
                    throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
                }

                // Verificar conflictos si se cambian datos críticos
                if (updateData.startTime || updateData.endTime || updateData.dayOfWeek || 
                    updateData.validFrom !== undefined || updateData.validTo !== undefined) {
                    
                    const hasConflict = await scheduleRepository.checkScheduleConflict(
                        dataToValidate.doctorId,
                        dataToValidate.dayOfWeek,
                        dataToValidate.startTime,
                        dataToValidate.endTime,
                        scheduleId,
                        dataToValidate.validFrom,
                        dataToValidate.validTo
                    );

                    if (hasConflict) {
                        throw new Error('El horario actualizado se superpone con un horario existente');
                    }
                }
            }

            // Actualizar horario
            updateData.user_updated = updatedBy;
            const updated = await scheduleRepository.updateSchedule(scheduleId, updateData);
            
            if (!updated) {
                throw new Error('No se pudo actualizar el horario');
            }

            return await scheduleRepository.findById(scheduleId);

        } catch (error) {
            throw new Error(`Error al actualizar horario: ${error.message}`);
        }
    }

    // Cambiar disponibilidad del horario
    async toggleScheduleAvailability(scheduleId, isAvailable, updatedBy) {
        try {
            const schedule = await scheduleRepository.findById(scheduleId);
            if (!schedule) {
                throw new Error('Horario no encontrado');
            }

            const updated = await scheduleRepository.toggleAvailability(scheduleId, isAvailable, updatedBy);
            
            if (!updated) {
                throw new Error('No se pudo cambiar la disponibilidad del horario');
            }

            return await scheduleRepository.findById(scheduleId);

        } catch (error) {
            throw new Error(`Error al cambiar disponibilidad: ${error.message}`);
        }
    }

    // Crear horario semanal completo para un doctor
    async createWeeklySchedule(doctorId, weeklyScheduleData, createdBy) {
        try {
            // Verificar que el doctor existe
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Doctor no encontrado');
            }

            const createdSchedules = [];
            const errors = [];

            // Crear horario para cada día especificado
            for (const dayData of weeklyScheduleData) {
                try {
                    const scheduleData = {
                        doctorId: doctorId,
                        dayOfWeek: dayData.dayOfWeek,
                        startTime: dayData.startTime,
                        endTime: dayData.endTime,
                        isAvailable: dayData.isAvailable !== undefined ? dayData.isAvailable : true,
                        breakStart: dayData.breakStart || null,
                        breakEnd: dayData.breakEnd || null,
                        slotDuration: dayData.slotDuration || 30,
                        maxPatientsPerSlot: dayData.maxPatientsPerSlot || 1,
                        scheduleType: dayData.scheduleType || 'regular',
                        validFrom: dayData.validFrom || null,
                        validTo: dayData.validTo || null,
                        isRecurring: dayData.isRecurring !== undefined ? dayData.isRecurring : true,
                        notes: dayData.notes || null
                    };

                    const schedule = await this.createScheduleWithValidation(scheduleData, createdBy);
                    createdSchedules.push(schedule);

                } catch (error) {
                    errors.push({
                        dayOfWeek: dayData.dayOfWeek,
                        error: error.message
                    });
                }
            }

            return {
                doctorId,
                doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                created: createdSchedules,
                errors: errors,
                summary: {
                    total: weeklyScheduleData.length,
                    successful: createdSchedules.length,
                    failed: errors.length
                }
            };

        } catch (error) {
            throw new Error(`Error al crear horario semanal: ${error.message}`);
        }
    }

    // Clonar horario a múltiples días
    async cloneScheduleToMultipleDays(scheduleId, targetDays, createdBy) {
        try {
            const clonedSchedules = await scheduleRepository.cloneSchedule(scheduleId, targetDays, createdBy);
            
            return {
                originalScheduleId: scheduleId,
                clonedSchedules: clonedSchedules,
                targetDays: targetDays,
                summary: {
                    total: targetDays.length,
                    successful: clonedSchedules.length
                }
            };

        } catch (error) {
            throw new Error(`Error al clonar horario: ${error.message}`);
        }
    }

    // Obtener horarios por doctor con análisis
    async getDoctorSchedulesWithAnalysis(doctorId, filters = {}) {
        try {
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Doctor no encontrado');
            }

            const schedules = await scheduleRepository.findByDoctor(doctorId, filters);

            // Organizar por día de la semana
            const weeklySchedule = this.organizeByWeekday(schedules);

            // Calcular estadísticas
            const stats = this.calculateScheduleStats(schedules);

            return {
                doctorId,
                doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                specialtyName: doctor.specialty ? doctor.specialty.name : 'Sin especialidad',
                weeklySchedule,
                schedules,
                stats,
                total: schedules.length
            };

        } catch (error) {
            throw new Error(`Error al obtener horarios del doctor: ${error.message}`);
        }
    }

    // Organizar horarios por día de la semana
    organizeByWeekday(schedules) {
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const weeklySchedule = {};

        for (let i = 0; i < 7; i++) {
            weeklySchedule[i] = {
                dayName: dayNames[i],
                schedules: schedules.filter(s => s.dayOfWeek === i)
            };
        }

        return weeklySchedule;
    }

    // Calcular estadísticas de horarios
    calculateScheduleStats(schedules) {
        const total = schedules.length;
        const available = schedules.filter(s => s.isAvailable && s.active).length;
        const byType = {};
        const byDay = {};
        let totalHours = 0;

        schedules.forEach(schedule => {
            // Por tipo
            if (!byType[schedule.scheduleType]) {
                byType[schedule.scheduleType] = 0;
            }
            byType[schedule.scheduleType]++;

            // Por día
            if (!byDay[schedule.dayOfWeek]) {
                byDay[schedule.dayOfWeek] = 0;
            }
            byDay[schedule.dayOfWeek]++;

            // Calcular horas totales
            if (schedule.isAvailable && schedule.active) {
                const startMinutes = this.timeToMinutes(schedule.startTime);
                const endMinutes = this.timeToMinutes(schedule.endTime);
                let scheduleHours = (endMinutes - startMinutes) / 60;

                // Restar tiempo de descanso
                if (schedule.breakStart && schedule.breakEnd) {
                    const breakStartMinutes = this.timeToMinutes(schedule.breakStart);
                    const breakEndMinutes = this.timeToMinutes(schedule.breakEnd);
                    const breakHours = (breakEndMinutes - breakStartMinutes) / 60;
                    scheduleHours -= breakHours;
                }

                totalHours += scheduleHours;
            }
        });

        return {
            total,
            available,
            unavailable: total - available,
            byType,
            byDay,
            totalWeeklyHours: Math.round(totalHours * 100) / 100,
            averageHoursPerDay: total > 0 ? Math.round((totalHours / 7) * 100) / 100 : 0
        };
    }

    // Buscar médicos disponibles en un horario específico
    async findAvailableDoctorsWithAnalysis(dayOfWeek, time, date = null, specialtyId = null) {
        try {
            const schedules = await scheduleRepository.findAvailableDoctors(dayOfWeek, time, date, specialtyId);

            const availableDoctors = schedules.map(schedule => ({
                scheduleId: schedule.id,
                doctorId: schedule.doctorId,
                doctorName: `Dr. ${schedule.doctor.firstName} ${schedule.doctor.lastName}`,
                medicalLicense: schedule.doctor.medicalLicense,
                specialtyName: schedule.doctor.specialty ? schedule.doctor.specialty.name : 'Sin especialidad',
                availableFrom: schedule.startTime,
                availableTo: schedule.endTime,
                slotDuration: schedule.slotDuration,
                maxPatientsPerSlot: schedule.maxPatientsPerSlot,
                scheduleType: schedule.scheduleType,
                hasBreak: !!(schedule.breakStart && schedule.breakEnd),
                breakInfo: schedule.breakStart && schedule.breakEnd ? {
                    start: schedule.breakStart,
                    end: schedule.breakEnd
                } : null
            }));

            return {
                searchCriteria: {
                    dayOfWeek,
                    time,
                    date,
                    specialtyId
                },
                availableDoctors,
                total: availableDoctors.length
            };

        } catch (error) {
            throw new Error(`Error al buscar médicos disponibles: ${error.message}`);
        }
    }

    // Obtener resumen semanal con análisis detallado
    async getWeeklyScheduleSummaryWithAnalysis(doctorId, weekStartDate = null) {
        try {
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Doctor no encontrado');
            }

            const weeklySchedule = await scheduleRepository.getWeeklyScheduleSummary(doctorId, weekStartDate);

            // Enriquecer con análisis
            const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const enrichedWeekly = {};
            let totalWeeklyHours = 0;
            let workingDays = 0;

            for (let day = 0; day < 7; day++) {
                const daySchedules = weeklySchedule[day];
                let dayHours = 0;
                let isWorkingDay = false;

                if (daySchedules.length > 0) {
                    daySchedules.forEach(schedule => {
                        if (schedule.isAvailable && schedule.active) {
                            isWorkingDay = true;
                            const startMinutes = this.timeToMinutes(schedule.startTime);
                            const endMinutes = this.timeToMinutes(schedule.endTime);
                            let scheduleHours = (endMinutes - startMinutes) / 60;

                            if (schedule.breakStart && schedule.breakEnd) {
                                const breakStartMinutes = this.timeToMinutes(schedule.breakStart);
                                const breakEndMinutes = this.timeToMinutes(schedule.breakEnd);
                                const breakHours = (breakEndMinutes - breakStartMinutes) / 60;
                                scheduleHours -= breakHours;
                            }

                            dayHours += scheduleHours;
                        }
                    });
                }

                if (isWorkingDay) {
                    workingDays++;
                    totalWeeklyHours += dayHours;
                }

                enrichedWeekly[day] = {
                    dayName: dayNames[day],
                    schedules: daySchedules,
                    isWorkingDay,
                    totalHours: Math.round(dayHours * 100) / 100,
                    scheduleCount: daySchedules.length,
                    availableSchedules: daySchedules.filter(s => s.isAvailable && s.active).length
                };
            }

            return {
                doctorId,
                doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                specialtyName: doctor.specialty ? doctor.specialty.name : 'Sin especialidad',
                weekStartDate,
                weeklySchedule: enrichedWeekly,
                summary: {
                    totalWeeklyHours: Math.round(totalWeeklyHours * 100) / 100,
                    workingDays,
                    averageHoursPerWorkingDay: workingDays > 0 ? 
                        Math.round((totalWeeklyHours / workingDays) * 100) / 100 : 0,
                    totalSchedules: Object.values(weeklySchedule).reduce((sum, day) => sum + day.length, 0)
                }
            };

        } catch (error) {
            throw new Error(`Error al obtener resumen semanal: ${error.message}`);
        }
    }

    // Validar antes de eliminar horario
    async validateScheduleDeletion(scheduleId) {
        try {
            const schedule = await scheduleRepository.findById(scheduleId);
            if (!schedule) {
                throw new Error('Horario no encontrado');
            }

            // Aquí se pueden agregar validaciones adicionales
            // Por ejemplo, verificar si hay citas programadas en este horario
            // Esto dependerá de la integración con el módulo de citas

            const warnings = [];
            if (schedule.isAvailable) {
                warnings.push('El horario está actualmente disponible y puede tener citas programadas');
            }

            return { 
                canDelete: true, 
                schedule,
                warnings 
            };

        } catch (error) {
            throw new Error(`Error al validar eliminación: ${error.message}`);
        }
    }

    // Obtener estadísticas con análisis de negocio
    async getEnhancedScheduleStats(filters = {}) {
        try {
            const stats = await scheduleRepository.getScheduleStats(filters);

            // Calcular estadísticas adicionales
            const typeDistribution = stats.byType.map(item => ({
                type: item.scheduleType,
                count: parseInt(item.dataValues.count),
                percentage: ((parseInt(item.dataValues.count) / stats.total) * 100).toFixed(1),
                displayName: this.getScheduleTypeDisplay(item.scheduleType)
            }));

            const doctorDistribution = stats.byDoctor.map(item => ({
                doctorId: item.doctorId,
                doctorName: `Dr. ${item.doctor.firstName} ${item.doctor.lastName}`,
                scheduleCount: parseInt(item.dataValues.count),
                percentage: ((parseInt(item.dataValues.count) / stats.total) * 100).toFixed(1)
            }));

            return {
                ...stats,
                typeDistribution,
                doctorDistribution,
                availablePercentage: ((stats.available / stats.total) * 100).toFixed(1),
                unavailablePercentage: ((stats.unavailable / stats.total) * 100).toFixed(1)
            };

        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    // Helper: Obtener texto de tipo de horario
    getScheduleTypeDisplay(type) {
        const typeMap = {
            'regular': 'Regular',
            'special': 'Especial',
            'emergency': 'Emergencia',
            'surgery': 'Cirugía'
        };
        return typeMap[type] || type;
    }

    // Generar reporte de horario
    async generateScheduleReport(scheduleId) {
        try {
            const schedule = await scheduleRepository.findById(scheduleId);
            if (!schedule) {
                throw new Error('Horario no encontrado');
            }

            const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            
            // Calcular duración
            const startMinutes = this.timeToMinutes(schedule.startTime);
            const endMinutes = this.timeToMinutes(schedule.endTime);
            let totalMinutes = endMinutes - startMinutes;
            
            if (schedule.breakStart && schedule.breakEnd) {
                const breakStartMinutes = this.timeToMinutes(schedule.breakStart);
                const breakEndMinutes = this.timeToMinutes(schedule.breakEnd);
                totalMinutes -= (breakEndMinutes - breakStartMinutes);
            }

            const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

            const report = {
                scheduleInfo: {
                    id: schedule.id,
                    dayOfWeek: schedule.dayOfWeek,
                    dayName: dayNames[schedule.dayOfWeek],
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    duration: `${totalHours} horas`,
                    isAvailable: schedule.isAvailable,
                    scheduleType: schedule.scheduleType,
                    scheduleTypeDisplay: this.getScheduleTypeDisplay(schedule.scheduleType),
                    slotDuration: `${schedule.slotDuration} minutos`,
                    maxPatientsPerSlot: schedule.maxPatientsPerSlot,
                    isRecurring: schedule.isRecurring
                },
                breakInfo: schedule.breakStart && schedule.breakEnd ? {
                    hasBreak: true,
                    breakStart: schedule.breakStart,
                    breakEnd: schedule.breakEnd,
                    breakDuration: `${Math.round(((this.timeToMinutes(schedule.breakEnd) - this.timeToMinutes(schedule.breakStart)) / 60) * 100) / 100} horas`
                } : {
                    hasBreak: false
                },
                validityPeriod: {
                    validFrom: schedule.validFrom,
                    validTo: schedule.validTo,
                    isOpenEnded: !schedule.validTo
                },
                doctorInfo: {
                    name: `Dr. ${schedule.doctor.firstName} ${schedule.doctor.lastName}`,
                    license: schedule.doctor.medicalLicense,
                    specialty: schedule.doctor.specialty ? schedule.doctor.specialty.name : 'Sin especialidad'
                },
                systemInfo: {
                    active: schedule.active,
                    createdAt: schedule.created_at,
                    updatedAt: schedule.updated_at,
                    notes: schedule.notes
                },
                generatedAt: new Date(),
                generatedBy: 'Sistema Onconor'
            };

            return report;

        } catch (error) {
            throw new Error(`Error al generar reporte: ${error.message}`);
        }
    }
}

module.exports = new ScheduleService();