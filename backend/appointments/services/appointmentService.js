const appointmentRepository = require('../repositories/appointmentRepository');
const scheduleRepository = require('../../schedules/repositories/scheduleRepository');
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

        // Validar doctor
        if (!appointmentData.doctorId || !Number.isInteger(Number(appointmentData.doctorId))) {
            errors.push('El ID del doctor es obligatorio y debe ser válido');
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
        } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(appointmentData.appointmentTime)) {
            errors.push('El formato de la hora no es válido (HH:MM)');
        }

        // Validar razón
        if (!appointmentData.reason || appointmentData.reason.trim() === '') {
            errors.push('La razón de la cita es obligatoria');
        } else if (appointmentData.reason.length < 10 || appointmentData.reason.length > 500) {
            errors.push('La razón debe tener entre 10 y 500 caracteres');
        }

        // Validar duración
        if (appointmentData.duration && (appointmentData.duration < 15 || appointmentData.duration > 240)) {
            errors.push('La duración debe estar entre 15 y 240 minutos');
        }

        // Validar prioridad
        if (appointmentData.priority && !['low', 'normal', 'high', 'urgent'].includes(appointmentData.priority)) {
            errors.push('La prioridad debe ser: low, normal, high o urgent');
        }

        return errors;
    }

    // Crear cita con validaciones de negocio
    async createAppointmentWithValidation(appointmentData, createdBy) {
        try {
            // Validar datos básicos
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
                throw new Error('El paciente no está activo');
            }

            // Verificar que el doctor existe y está activo
            const doctor = await doctorRepository.findById(appointmentData.doctorId);
            if (!doctor) {
                throw new Error('El doctor especificado no existe');
            }
            if (!doctor.active) {
                throw new Error('El doctor no está activo');
            }

            // Verificar disponibilidad del doctor en la fecha y hora
            const dayOfWeek = new Date(appointmentData.appointmentDate).getDay();
            const schedule = await scheduleRepository.findByDoctorAndDay(
                appointmentData.doctorId, 
                dayOfWeek, 
                appointmentData.appointmentDate
            );

            if (!schedule) {
                throw new Error('El doctor no tiene horario disponible para este día');
            }

            // Verificar que la hora está dentro del horario del doctor
            const appointmentTime = appointmentData.appointmentTime;
            if (appointmentTime < schedule.startTime || appointmentTime >= schedule.endTime) {
                throw new Error(`La hora debe estar entre ${schedule.startTime} y ${schedule.endTime}`);
            }

            // Verificar que no es horario de break
            if (schedule.breakStart && schedule.breakEnd) {
                if (appointmentTime >= schedule.breakStart && appointmentTime < schedule.breakEnd) {
                    throw new Error(`La hora seleccionada está en el horario de descanso (${schedule.breakStart} - ${schedule.breakEnd})`);
                }
            }

            // Verificar disponibilidad (no hay conflictos)
            const duration = appointmentData.duration || 30;
            const isAvailable = await appointmentRepository.checkAvailability(
                appointmentData.doctorId,
                appointmentData.appointmentDate,
                appointmentData.appointmentTime,
                duration
            );

            if (!isAvailable) {
                throw new Error('El horario seleccionado no está disponible');
            }

            // Establecer valores por defecto
            appointmentData.status = appointmentData.status || 'scheduled';
            appointmentData.duration = duration;
            appointmentData.priority = appointmentData.priority || 'normal';
            appointmentData.user_created = createdBy;

            // Crear la cita
            const appointment = await appointmentRepository.createAppointment(appointmentData);

            return appointment;

        } catch (error) {
            throw new Error(`Error al crear cita: ${error.message}`);
        }
    }

    // Actualizar cita con validaciones
    async updateAppointmentWithValidation(appointmentId, updateData, updatedBy) {
        try {
            // Verificar que la cita existe
            const existingAppointment = await appointmentRepository.findById(appointmentId);
            if (!existingAppointment) {
                throw new Error('Cita no encontrada');
            }

            // No permitir actualizar citas completadas o canceladas
            if (['completed', 'cancelled'].includes(existingAppointment.status)) {
                throw new Error('No se puede modificar una cita completada o cancelada');
            }

            // Si se está cambiando fecha, hora o doctor, verificar disponibilidad
            if (updateData.appointmentDate || updateData.appointmentTime || updateData.doctorId) {
                const newDate = updateData.appointmentDate || existingAppointment.appointmentDate;
                const newTime = updateData.appointmentTime || existingAppointment.appointmentTime;
                const newDoctorId = updateData.doctorId || existingAppointment.doctorId;
                const duration = updateData.duration || existingAppointment.duration;

                // Verificar horario del doctor
                const dayOfWeek = new Date(newDate).getDay();
                const schedule = await scheduleRepository.findByDoctorAndDay(newDoctorId, dayOfWeek, newDate);

                if (!schedule) {
                    throw new Error('El doctor no tiene horario disponible para este día');
                }

                // Verificar disponibilidad
                const isAvailable = await appointmentRepository.checkAvailability(
                    newDoctorId,
                    newDate,
                    newTime,
                    duration,
                    appointmentId
                );

                if (!isAvailable) {
                    throw new Error('El horario seleccionado no está disponible');
                }
            }

            // Validar datos si se están actualizando
            if (updateData.reason || updateData.appointmentDate || updateData.appointmentTime) {
                const dataToValidate = {
                    patientId: updateData.patientId || existingAppointment.patientId,
                    doctorId: updateData.doctorId || existingAppointment.doctorId,
                    appointmentDate: updateData.appointmentDate || existingAppointment.appointmentDate,
                    appointmentTime: updateData.appointmentTime || existingAppointment.appointmentTime,
                    reason: updateData.reason || existingAppointment.reason,
                    duration: updateData.duration || existingAppointment.duration,
                    priority: updateData.priority || existingAppointment.priority
                };

                const validationErrors = this.validateAppointmentData(dataToValidate);
                if (validationErrors.length > 0) {
                    throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
                }
            }

            // Actualizar cita
            updateData.user_updated = updatedBy;
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
    async cancelAppointmentWithValidation(appointmentId, cancelReason, cancelledBy) {
        try {
            // Verificar que la cita existe
            const appointment = await appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new Error('Cita no encontrada');
            }

            // Verificar que se puede cancelar
            if (['completed', 'cancelled'].includes(appointment.status)) {
                throw new Error('La cita ya está completada o cancelada');
            }

            // Verificar que no es muy tarde para cancelar (opcional - regla de negocio)
            const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
            const now = new Date();
            const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);

            if (hoursUntilAppointment < 2) {
                // Permitir pero registrar como cancelación tardía
                console.warn(`Cancelación tardía: ${hoursUntilAppointment} horas antes de la cita`);
            }

            // Validar razón de cancelación
            if (!cancelReason || cancelReason.trim().length < 5) {
                throw new Error('Debe proporcionar una razón de cancelación válida (mínimo 5 caracteres)');
            }

            // Cancelar la cita
            const cancelled = await appointmentRepository.cancelAppointment(appointmentId, cancelReason, cancelledBy);
            
            if (!cancelled) {
                throw new Error('No se pudo cancelar la cita');
            }

            return await appointmentRepository.findById(appointmentId);

        } catch (error) {
            throw new Error(`Error al cancelar cita: ${error.message}`);
        }
    }

    // Confirmar cita
    async confirmAppointmentWithValidation(appointmentId, confirmedBy) {
        try {
            const appointment = await appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new Error('Cita no encontrada');
            }

            if (appointment.status !== 'scheduled') {
                throw new Error('Solo se pueden confirmar citas programadas');
            }

            const confirmed = await appointmentRepository.confirmAppointment(appointmentId, confirmedBy);
            
            if (!confirmed) {
                throw new Error('No se pudo confirmar la cita');
            }

            return await appointmentRepository.findById(appointmentId);

        } catch (error) {
            throw new Error(`Error al confirmar cita: ${error.message}`);
        }
    }

    // Completar cita
    async completeAppointmentWithValidation(appointmentId, completedBy) {
        try {
            const appointment = await appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new Error('Cita no encontrada');
            }

            if (!['confirmed', 'in_progress'].includes(appointment.status)) {
                throw new Error('Solo se pueden completar citas confirmadas o en progreso');
            }

            const completed = await appointmentRepository.completeAppointment(appointmentId, completedBy);
            
            if (!completed) {
                throw new Error('No se pudo completar la cita');
            }

            return await appointmentRepository.findById(appointmentId);

        } catch (error) {
            throw new Error(`Error al completar cita: ${error.message}`);
        }
    }

    // Reprogramar cita
    async rescheduleAppointmentWithValidation(appointmentId, newDate, newTime, rescheduledBy) {
        try {
            const appointment = await appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new Error('Cita no encontrada');
            }

            if (['completed', 'cancelled'].includes(appointment.status)) {
                throw new Error('No se puede reprogramar una cita completada o cancelada');
            }

            // Verificar que la nueva fecha no es en el pasado
            const newAppointmentDate = new Date(newDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (newAppointmentDate < today) {
                throw new Error('La nueva fecha no puede ser en el pasado');
            }

            // Verificar disponibilidad en la nueva fecha y hora
            const isAvailable = await appointmentRepository.checkAvailability(
                appointment.doctorId,
                newDate,
                newTime,
                appointment.duration,
                appointmentId
            );

            if (!isAvailable) {
                throw new Error('El nuevo horario no está disponible');
            }

            // Verificar horario del doctor
            const dayOfWeek = newAppointmentDate.getDay();
            const schedule = await scheduleRepository.findByDoctorAndDay(
                appointment.doctorId, 
                dayOfWeek, 
                newDate
            );

            if (!schedule) {
                throw new Error('El doctor no tiene horario disponible para el nuevo día');
            }

            if (newTime < schedule.startTime || newTime >= schedule.endTime) {
                throw new Error(`La nueva hora debe estar entre ${schedule.startTime} y ${schedule.endTime}`);
            }

            // Reprogramar la cita
            const rescheduled = await appointmentRepository.rescheduleAppointment(
                appointmentId, 
                newDate, 
                newTime, 
                rescheduledBy
            );
            
            if (!rescheduled) {
                throw new Error('No se pudo reprogramar la cita');
            }

            return await appointmentRepository.findById(appointmentId);

        } catch (error) {
            throw new Error(`Error al reprogramar cita: ${error.message}`);
        }
    }

    // Buscar citas con lógica de negocio
    async searchAppointmentsWithBusinessLogic(filters, pagination = null) {
        try {
            // Limpiar y validar filtros
            const cleanFilters = {};
            
            if (filters.patientId && Number.isInteger(Number(filters.patientId))) {
                cleanFilters.patientId = parseInt(filters.patientId);
            }
            
            if (filters.doctorId && Number.isInteger(Number(filters.doctorId))) {
                cleanFilters.doctorId = parseInt(filters.doctorId);
            }

            if (filters.status && ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].includes(filters.status)) {
                cleanFilters.status = filters.status;
            }

            if (filters.dateFrom && filters.dateTo) {
                cleanFilters.dateFrom = filters.dateFrom;
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
                    patientFullName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
                    doctorFullName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                    specialtyName: appointment.doctor.specialty ? appointment.doctor.specialty.name : 'Sin especialidad',
                    statusDisplay: this.getStatusDisplay(appointment.status),
                    canCancel: this.canCancelAppointment(appointment),
                    canReschedule: this.canRescheduleAppointment(appointment)
                }));
            } else {
                // Implementar búsqueda sin paginación según sea necesario
                result = { appointments: [], total: 0 };
            }

            return result;

        } catch (error) {
            throw new Error(`Error en búsqueda de citas: ${error.message}`);
        }
    }

    // Obtener slots disponibles para un doctor en una fecha
    async getAvailableSlots(doctorId, date, duration = 30) {
        try {
            // Verificar que el doctor existe
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Doctor no encontrado');
            }

            // Obtener slots disponibles
            const availableSlots = await appointmentRepository.findAvailableSlots(doctorId, date, duration);

            return {
                doctorId,
                date,
                duration,
                slots: availableSlots,
                doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                specialtyName: doctor.specialty ? doctor.specialty.name : 'Sin especialidad'
            };

        } catch (error) {
            throw new Error(`Error al obtener slots disponibles: ${error.message}`);
        }
    }

    // Procesar recordatorios de citas
    async processAppointmentReminders() {
        try {
            const pendingReminders = await appointmentRepository.findPendingReminders();
            const results = [];

            for (const appointment of pendingReminders) {
                try {
                    // Aquí se integraría con servicio de notificaciones
                    // Por ahora solo marcamos como enviado
                    await appointmentRepository.markReminderSent(appointment.id);
                    
                    results.push({
                        appointmentId: appointment.id,
                        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
                        status: 'sent'
                    });
                } catch (error) {
                    results.push({
                        appointmentId: appointment.id,
                        status: 'error',
                        error: error.message
                    });
                }
            }

            return {
                processed: results.length,
                successful: results.filter(r => r.status === 'sent').length,
                failed: results.filter(r => r.status === 'error').length,
                results
            };

        } catch (error) {
            throw new Error(`Error al procesar recordatorios: ${error.message}`);
        }
    }

    // Obtener estadísticas con análisis de negocio
    async getEnhancedAppointmentStats(filters = {}) {
        try {
            const stats = await appointmentRepository.getAppointmentStats(filters);

            // Calcular estadísticas adicionales
            const statusDistribution = stats.byStatus.map(item => ({
                status: item.status,
                count: parseInt(item.dataValues.count),
                percentage: ((parseInt(item.dataValues.count) / stats.total) * 100).toFixed(1),
                displayName: this.getStatusDisplay(item.status)
            }));

            const doctorPerformance = stats.byDoctor.map(item => ({
                doctorId: item.doctorId,
                doctorName: `Dr. ${item.doctor.firstName} ${item.doctor.lastName}`,
                specialtyName: item.doctor.specialty ? item.doctor.specialty.name : 'Sin especialidad',
                appointmentCount: parseInt(item.dataValues.count),
                percentage: ((parseInt(item.dataValues.count) / stats.total) * 100).toFixed(1)
            }));

            return {
                ...stats,
                statusDistribution,
                doctorPerformance,
                upcomingPercentage: ((stats.upcoming / stats.total) * 100).toFixed(1)
            };

        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    // Helper: Obtener texto de estado
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

    // Helper: Verificar si se puede cancelar
    canCancelAppointment(appointment) {
        if (['completed', 'cancelled'].includes(appointment.status)) {
            return false;
        }
        
        const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
        const now = new Date();
        
        return appointmentDateTime > now;
    }

    // Helper: Verificar si se puede reprogramar
    canRescheduleAppointment(appointment) {
        if (['completed', 'cancelled'].includes(appointment.status)) {
            return false;
        }
        
        const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
        const now = new Date();
        
        return appointmentDateTime > now;
    }

    // Generar reporte de cita
    async generateAppointmentReport(appointmentId) {
        try {
            const appointment = await appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new Error('Cita no encontrada');
            }

            const report = {
                appointmentInfo: {
                    id: appointment.id,
                    date: appointment.appointmentDate,
                    time: appointment.appointmentTime,
                    duration: appointment.duration,
                    reason: appointment.reason,
                    status: appointment.status,
                    statusDisplay: this.getStatusDisplay(appointment.status),
                    priority: appointment.priority,
                    notes: appointment.notes
                },
                patientInfo: {
                    name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
                    dni: appointment.patient.dni,
                    phone: appointment.patient.phone
                },
                doctorInfo: {
                    name: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                    license: appointment.doctor.medicalLicense,
                    specialty: appointment.doctor.specialty ? appointment.doctor.specialty.name : 'Sin especialidad',
                    phone: appointment.doctor.phone
                },
                systemInfo: {
                    createdAt: appointment.created_at,
                    updatedAt: appointment.updated_at,
                    reminderSent: appointment.reminderSent
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

module.exports = new AppointmentService();