const appointmentRepository = require('../repositories/appointmentRepository');
const patientRepository = require('../../patients/repositories/patientRepository');
const doctorRepository = require('../../doctors/repositories/doctorRepository');

class AppointmentService {

    // Validar datos de la cita
    validateAppointmentData(appointmentData) {
        const errors = [];

        // Validar paciente
        if (!appointmentData.patientId || !Number.isInteger(Number(appointmentData.patientId))) {
            errors.push('El ID del paciente es obligatorio y debe ser válido');
        }

        // Validar médico
        if (!appointmentData.doctorId || !Number.isInteger(Number(appointmentData.doctorId))) {
            errors.push('El ID del médico es obligatorio y debe ser válido');
        }

        // Validar fecha
        if (!appointmentData.appointmentDate) {
            errors.push('La fecha de la cita es obligatoria');
        } else {
            const appointmentDate = new Date(appointmentData.appointmentDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (appointmentDate < today) {
                errors.push('La fecha de la cita no puede ser en el pasado');
            }
        }

        // Validar hora
        if (!appointmentData.appointmentTime) {
            errors.push('La hora de la cita es obligatoria');
        } else {
            // Validar formato de hora (HH:MM)
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(appointmentData.appointmentTime)) {
                errors.push('El formato de la hora debe ser HH:MM');
            }
        }

        // Validar motivo
        if (!appointmentData.reason || appointmentData.reason.trim() === '') {
            errors.push('El motivo de la cita es obligatorio');
        } else if (appointmentData.reason.length < 10 || appointmentData.reason.length > 500) {
            errors.push('El motivo debe tener entre 10 y 500 caracteres');
        }

        // Validar duración estimada
        if (appointmentData.estimatedDuration) {
            const duration = parseInt(appointmentData.estimatedDuration);
            if (duration < 15 || duration > 240) {
                errors.push('La duración estimada debe estar entre 15 y 240 minutos');
            }
        }

        return errors;
    }

    // Crear cita con validaciones de negocio
    async createAppointmentWithValidation(appointmentData, userId) {
        try {
            // Validar datos
            const validationErrors = this.validateAppointmentData(appointmentData);
            if (validationErrors.length > 0) {
                throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
            }

            // Verificar que el paciente existe y está activo
            const patient = await patientRepository.findById(appointmentData.patientId);
            if (!patient) {
                throw new Error('El paciente especificado no existe');
            }
            if (!patient.active) {
                throw new Error('El paciente especificado no está activo');
            }

            // Verificar que el médico existe y está activo
            const doctor = await doctorRepository.findById(appointmentData.doctorId);
            if (!doctor) {
                throw new Error('El médico especificado no existe');
            }
            if (!doctor.active) {
                throw new Error('El médico especificado no está activo');
            }

            // Verificar disponibilidad del médico
            const isAvailable = await this.checkDoctorAvailability(
                appointmentData.doctorId,
                appointmentData.appointmentDate,
                appointmentData.appointmentTime,
                appointmentData.estimatedDuration || 30
            );

            if (!isAvailable.available) {
                throw new Error(`Médico no disponible: ${isAvailable.reason}`);
            }

            // Crear cita
            appointmentData.user_created = userId;
            appointmentData.status = 'scheduled';
            
            const appointment = await appointmentRepository.createAppointment(appointmentData);

            return appointment;

        } catch (error) {
            throw new Error(`Error al crear cita: ${error.message}`);
        }
    }

    // Verificar disponibilidad del médico
    async checkDoctorAvailability(doctorId, date, time, duration = 30) {
        try {
            // Obtener citas existentes del médico en esa fecha
            const existingAppointments = await appointmentRepository.findByDateAndDoctor(date, doctorId);

            // Convertir hora de inicio y calcular hora de fin
            const [startHour, startMinute] = time.split(':').map(Number);
            const startTimeMinutes = startHour * 60 + startMinute;
            const endTimeMinutes = startTimeMinutes + duration;

            // Verificar conflictos con citas existentes
            for (const appointment of existingAppointments) {
                const [existingHour, existingMinute] = appointment.appointmentTime.split(':').map(Number);
                const existingStartMinutes = existingHour * 60 + existingMinute;
                const existingEndMinutes = existingStartMinutes + (appointment.estimatedDuration || 30);

                // Verificar solapamiento
                if (
                    (startTimeMinutes >= existingStartMinutes && startTimeMinutes < existingEndMinutes) ||
                    (endTimeMinutes > existingStartMinutes && endTimeMinutes <= existingEndMinutes) ||
                    (startTimeMinutes <= existingStartMinutes && endTimeMinutes >= existingEndMinutes)
                ) {
                    return {
                        available: false,
                        reason: `Conflicto con cita existente a las ${appointment.appointmentTime}`
                    };
                }
            }

            return { available: true, reason: 'Horario disponible' };

        } catch (error) {
            throw new Error(`Error al verificar disponibilidad: ${error.message}`);
        }
    }

    // Actualizar cita con validaciones
    async updateAppointmentWithValidation(appointmentId, updateData, userId) {
        try {
            // Verificar que la cita existe
            const existingAppointment = await appointmentRepository.findById(appointmentId);
            if (!existingAppointment) {
                throw new Error('Cita no encontrada');
            }

            // Verificar si se puede modificar según el estado
            if (['completed', 'cancelled'].includes(existingAppointment.status)) {
                throw new Error('No se puede modificar una cita completada o cancelada');
            }

            // Si se está cambiando fecha/hora, validar disponibilidad
            if (updateData.appointmentDate || updateData.appointmentTime) {
                const newDate = updateData.appointmentDate || existingAppointment.appointmentDate;
                const newTime = updateData.appointmentTime || existingAppointment.appointmentTime;
                const duration = updateData.estimatedDuration || existingAppointment.estimatedDuration;

                const isAvailable = await this.checkDoctorAvailability(
                    existingAppointment.doctorId,
                    newDate,
                    newTime,
                    duration,
                    appointmentId // Excluir la cita actual
                );

                if (!isAvailable.available) {
                    throw new Error(`Médico no disponible: ${isAvailable.reason}`);
                }
            }

            // Validar datos si se están actualizando
            if (Object.keys(updateData).some(key => ['patientId', 'doctorId', 'appointmentDate', 'appointmentTime', 'reason'].includes(key))) {
                const dataToValidate = {
                    patientId: updateData.patientId || existingAppointment.patientId,
                    doctorId: updateData.doctorId || existingAppointment.doctorId,
                    appointmentDate: updateData.appointmentDate || existingAppointment.appointmentDate,
                    appointmentTime: updateData.appointmentTime || existingAppointment.appointmentTime,
                    reason: updateData.reason || existingAppointment.reason,
                    estimatedDuration: updateData.estimatedDuration || existingAppointment.estimatedDuration
                };

                const validationErrors = this.validateAppointmentData(dataToValidate);
                if (validationErrors.length > 0) {
                    throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
                }
            }

            // Actualizar cita
            updateData.user_updated = userId;
            const updated = await appointmentRepository.updateAppointment(appointmentId, updateData);
            
            if (!updated) {
                throw new Error('No se pudo actualizar la cita');
            }

            return await appointmentRepository.findById(appointmentId);

        } catch (error) {
            throw new Error(`Error al actualizar cita: ${error.message}`);
        }
    }

    // Cancelar cita con validaciones
    async cancelAppointmentWithValidation(appointmentId, userId, reason = null) {
        try {
            // Verificar que la cita existe
            const appointment = await appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new Error('Cita no encontrada');
            }

            // Verificar si se puede cancelar
            if (['completed', 'cancelled'].includes(appointment.status)) {
                throw new Error('No se puede cancelar una cita que ya está completada o cancelada');
            }

            // Verificar si es muy tarde para cancelar (opcional - regla de negocio)
            const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
            const now = new Date();
            const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);

            if (hoursUntilAppointment < 2 && hoursUntilAppointment > 0) {
                // Advertencia pero permite cancelar
                console.warn(`Cancelación tardía: Solo ${hoursUntilAppointment.toFixed(1)} horas antes de la cita`);
            }

            const cancelled = await appointmentRepository.cancelAppointment(appointmentId, userId, reason);
            if (!cancelled) {
                throw new Error('No se pudo cancelar la cita');
            }

            return await appointmentRepository.findById(appointmentId);

        } catch (error) {
            throw new Error(`Error al cancelar cita: ${error.message}`);
        }
    }

    // Confirmar cita
    async confirmAppointmentWithValidation(appointmentId, userId) {
        try {
            const appointment = await appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new Error('Cita no encontrada');
            }

            if (appointment.status !== 'scheduled') {
                throw new Error('Solo se pueden confirmar citas programadas');
            }

            const confirmed = await appointmentRepository.confirmAppointment(appointmentId, userId);
            if (!confirmed) {
                throw new Error('No se pudo confirmar la cita');
            }

            return await appointmentRepository.findById(appointmentId);

        } catch (error) {
            throw new Error(`Error al confirmar cita: ${error.message}`);
        }
    }

    // Completar cita
    async completeAppointmentWithValidation(appointmentId, userId, notes = null) {
        try {
            const appointment = await appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new Error('Cita no encontrada');
            }

            if (!['confirmed', 'in_progress'].includes(appointment.status)) {
                throw new Error('Solo se pueden completar citas confirmadas o en progreso');
            }

            const completed = await appointmentRepository.completeAppointment(appointmentId, userId, notes);
            if (!completed) {
                throw new Error('No se pudo completar la cita');
            }

            return await appointmentRepository.findById(appointmentId);

        } catch (error) {
            throw new Error(`Error al completar cita: ${error.message}`);
        }
    }

    // Obtener citas con filtros de negocio
    async getAppointmentsWithBusinessLogic(filters, pagination = null) {
        try {
            // Limpiar y validar filtros
            const cleanFilters = {};
            
            if (filters.status && ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].includes(filters.status)) {
                cleanFilters.status = filters.status;
            }
            
            if (filters.doctorId && Number.isInteger(Number(filters.doctorId))) {
                cleanFilters.doctorId = parseInt(filters.doctorId);
            }
            
            if (filters.patientId && Number.isInteger(Number(filters.patientId))) {
                cleanFilters.patientId = parseInt(filters.patientId);
            }

            if (filters.dateFrom) {
                cleanFilters.dateFrom = filters.dateFrom;
            }

            if (filters.dateTo) {
                cleanFilters.dateTo = filters.dateTo;
            }

            if (filters.search) {
                cleanFilters.search = filters.search.trim();
            }

            let result;
            if (pagination) {
                result = await appointmentRepository.findWithPagination(
                    pagination.page, 
                    pagination.limit, 
                    cleanFilters
                );
                
                // Enriquecer datos
                result.appointments = result.appointments.map(appointment => ({
                    ...appointment.toJSON(),
                    patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
                    doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                    specialtyName: appointment.doctor.specialty ? appointment.doctor.specialty.name : 'Sin especialidad',
                    statusDisplay: this.getStatusDisplay(appointment.status)
                }));
            } else {
                // Sin paginación - implementar según necesidad
                throw new Error('Búsqueda sin paginación no implementada');
            }

            return result;

        } catch (error) {
            throw new Error(`Error en búsqueda de citas: ${error.message}`);
        }
    }

    // Obtener display del estado
    getStatusDisplay(status) {
        const statusMap = {
            'scheduled': 'Programada',
            'confirmed': 'Confirmada',
            'in_progress': 'En Progreso',
            'completed': 'Completada',
            'cancelled': 'Cancelada',
            'no_show': 'No Asistió'
        };
        return statusMap[status] || status;
    }

    // Obtener citas próximas para notificaciones
    async getUpcomingAppointments(hoursAhead = 24) {
        try {
            const appointments = await appointmentRepository.findUpcomingAppointments(hoursAhead);
            
            return appointments.map(appointment => ({
                ...appointment.toJSON(),
                patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
                doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                patientEmail: appointment.patient.user?.email,
                patientPhone: appointment.patient.phone,
                timeUntilAppointment: this.calculateTimeUntilAppointment(
                    appointment.appointmentDate, 
                    appointment.appointmentTime
                )
            }));

        } catch (error) {
            throw new Error(`Error al obtener citas próximas: ${error.message}`);
        }
    }

    // Calcular tiempo hasta la cita
    calculateTimeUntilAppointment(date, time) {
        const appointmentDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        const diffMs = appointmentDateTime - now;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return { hours, minutes, total_minutes: Math.floor(diffMs / (1000 * 60)) };
    }

    // Obtener estadísticas mejoradas
    async getEnhancedAppointmentStats() {
        try {
            const stats = await appointmentRepository.getAppointmentStats();

            // Validar que byStatus existe y es un array
            const byStatus = stats.byStatus || [];
            
            // Calcular tasas y porcentajes
            const totalActive = byStatus.reduce((sum, item) => {
                const count = item.dataValues?.count || item.count || 0;
                return sum + parseInt(count);
            }, 0);
            
            const enrichedStats = {
                ...stats,
                totalActive,
                statusDistribution: byStatus.map(item => {
                    const count = item.dataValues?.count || item.count || 0;
                    return {
                        status: item.status,
                        count: parseInt(count),
                        percentage: totalActive > 0 ? ((parseInt(count) / totalActive) * 100).toFixed(1) : '0.0',
                        display: this.getStatusDisplay(item.status)
                    };
                }),
                completionRate: this.calculateCompletionRate(byStatus),
                cancellationRate: this.calculateCancellationRate(byStatus)
            };

            return enrichedStats;

        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    // Calcular tasa de finalización
    calculateCompletionRate(statusStats) {
        if (!statusStats || statusStats.length === 0) return '0.0';
        
        const completed = statusStats.find(s => s.status === 'completed');
        const total = statusStats.reduce((sum, item) => {
            const count = item.dataValues?.count || item.count || 0;
            return sum + parseInt(count);
        }, 0);
        
        if (total === 0) return '0.0';
        const completedCount = completed?.dataValues?.count || completed?.count || 0;
        return ((parseInt(completedCount) / total) * 100).toFixed(1);
    }

    // Calcular tasa de cancelación
    calculateCancellationRate(statusStats) {
        if (!statusStats || statusStats.length === 0) return '0.0';
        
        const cancelled = statusStats.find(s => s.status === 'cancelled');
        const noShow = statusStats.find(s => s.status === 'no_show');
        const total = statusStats.reduce((sum, item) => {
            const count = item.dataValues?.count || item.count || 0;
            return sum + parseInt(count);
        }, 0);
        
        if (total === 0) return '0.0';
        const cancelledCount = parseInt(cancelled?.dataValues?.count || cancelled?.count || 0) + 
                              parseInt(noShow?.dataValues?.count || noShow?.count || 0);
        return ((cancelledCount / total) * 100).toFixed(1);
    }
}

module.exports = new AppointmentService();