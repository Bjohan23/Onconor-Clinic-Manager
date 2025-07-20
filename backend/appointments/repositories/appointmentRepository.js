const { Appointment, Patient, Doctor, Specialty, AppointmentStatus } = require('../../shared/models');
const { Op } = require('sequelize');

class AppointmentRepository {
    
    // Crear una nueva cita
    async createAppointment(appointmentData) {
        try {
            const appointment = await Appointment.create(appointmentData);
            return appointment;
        } catch (error) {
            throw new Error(`Error al crear cita: ${error.message}`);
        }
    }

    // Buscar cita por ID
    async findById(id) {
        try {
            const appointment = await Appointment.findOne({
                where: { 
                    id: id,
                    flg_deleted: false
                },
                include: [
                    {
                        model: Patient,
                        as: 'patient',
                        attributes: ['id', 'dni', 'firstName', 'lastName', 'phone']
                    },
                    {
                        model: Doctor,
                        as: 'doctor',
                        attributes: ['id', 'medicalLicense', 'firstName', 'lastName', 'phone'],
                        include: [{
                            model: Specialty,
                            as: 'specialty',
                            attributes: ['id', 'name']
                        }]
                    },
                    {
                        model: AppointmentStatus,
                        as: 'appointmentStatus',
                        attributes: ['id', 'name', 'color', 'category']
                    }
                ]
            });
            return appointment;
        } catch (error) {
            throw new Error(`Error al buscar cita por ID: ${error.message}`);
        }
    }

    // Buscar citas por paciente
    async findByPatient(patientId, filters = {}) {
        try {
            const whereClause = {
                patientId: patientId,
                flg_deleted: false
            };

            if (filters.status) {
                whereClause.status = filters.status;
            }

            if (filters.dateFrom) {
                whereClause.appointmentDate = { [Op.gte]: filters.dateFrom };
            }

            if (filters.dateTo) {
                whereClause.appointmentDate = { 
                    ...whereClause.appointmentDate,
                    [Op.lte]: filters.dateTo 
                };
            }

            const appointments = await Appointment.findAll({
                where: whereClause,
                include: [
                    {
                        model: Doctor,
                        as: 'doctor',
                        attributes: ['id', 'firstName', 'lastName', 'medicalLicense'],
                        include: [{
                            model: Specialty,
                            as: 'specialty',
                            attributes: ['name']
                        }]
                    },
                    {
                        model: AppointmentStatus,
                        as: 'appointmentStatus',
                        attributes: ['name', 'color', 'category']
                    }
                ],
                order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
            });
            
            return appointments;
        } catch (error) {
            throw new Error(`Error al buscar citas por paciente: ${error.message}`);
        }
    }

    // Buscar citas por doctor
    async findByDoctor(doctorId, filters = {}) {
        try {
            const whereClause = {
                doctorId: doctorId,
                flg_deleted: false
            };

            if (filters.status) {
                whereClause.status = filters.status;
            }

            if (filters.date) {
                whereClause.appointmentDate = filters.date;
            }

            if (filters.dateFrom && filters.dateTo) {
                whereClause.appointmentDate = {
                    [Op.between]: [filters.dateFrom, filters.dateTo]
                };
            }

            const appointments = await Appointment.findAll({
                where: whereClause,
                include: [
                    {
                        model: Patient,
                        as: 'patient',
                        attributes: ['id', 'dni', 'firstName', 'lastName', 'phone']
                    },
                    {
                        model: AppointmentStatus,
                        as: 'appointmentStatus',
                        attributes: ['name', 'color', 'category']
                    }
                ],
                order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
            });
            
            return appointments;
        } catch (error) {
            throw new Error(`Error al buscar citas por doctor: ${error.message}`);
        }
    }

    // Buscar citas por fecha
    async findByDate(date, filters = {}) {
        try {
            const whereClause = {
                appointmentDate: date,
                flg_deleted: false,
                active: true
            };

            if (filters.doctorId) {
                whereClause.doctorId = filters.doctorId;
            }

            if (filters.status) {
                whereClause.status = filters.status;
            }

            const appointments = await Appointment.findAll({
                where: whereClause,
                include: [
                    {
                        model: Patient,
                        as: 'patient',
                        attributes: ['id', 'dni', 'firstName', 'lastName', 'phone']
                    },
                    {
                        model: Doctor,
                        as: 'doctor',
                        attributes: ['id', 'firstName', 'lastName', 'medicalLicense'],
                        include: [{
                            model: Specialty,
                            as: 'specialty',
                            attributes: ['name']
                        }]
                    },
                    {
                        model: AppointmentStatus,
                        as: 'appointmentStatus',
                        attributes: ['name', 'color', 'category']
                    }
                ],
                order: [['appointmentTime', 'ASC']]
            });
            
            return appointments;
        } catch (error) {
            throw new Error(`Error al buscar citas por fecha: ${error.message}`);
        }
    }

    // Verificar disponibilidad de horario
    async checkAvailability(doctorId, appointmentDate, appointmentTime, duration = 30, excludeId = null) {
        try {
            const whereClause = {
                doctorId: doctorId,
                appointmentDate: appointmentDate,
                status: { [Op.notIn]: ['cancelled', 'no_show'] },
                flg_deleted: false
            };

            if (excludeId) {
                whereClause.id = { [Op.ne]: excludeId };
            }

            // Calcular rango de tiempo con duración
            const startTime = appointmentTime;
            const endTime = this.addMinutes(appointmentTime, duration);

            const conflictingAppointments = await Appointment.findAll({
                where: {
                    ...whereClause,
                    [Op.or]: [
                        // Nueva cita comienza durante una cita existente
                        {
                            appointmentTime: { [Op.lte]: startTime },
                            [Op.and]: [
                                Appointment.sequelize.literal(`ADDTIME(appointment_time, SEC_TO_TIME(duration * 60)) > '${startTime}'`)
                            ]
                        },
                        // Nueva cita termina durante una cita existente
                        {
                            appointmentTime: { [Op.lt]: endTime },
                            [Op.and]: [
                                Appointment.sequelize.literal(`ADDTIME(appointment_time, SEC_TO_TIME(duration * 60)) > '${appointmentTime}'`)
                            ]
                        },
                        // Nueva cita engloba una cita existente
                        {
                            appointmentTime: { [Op.gte]: startTime },
                            [Op.and]: [
                                Appointment.sequelize.literal(`ADDTIME(appointment_time, SEC_TO_TIME(duration * 60)) <= '${endTime}'`)
                            ]
                        }
                    ]
                }
            });

            return conflictingAppointments.length === 0;
        } catch (error) {
            throw new Error(`Error al verificar disponibilidad: ${error.message}`);
        }
    }

    // Helper para agregar minutos a una hora
    addMinutes(time, minutes) {
        const [hours, mins] = time.split(':').map(Number);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60) % 24;
        const newMins = totalMinutes % 60;
        return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}:00`;
    }

    // Actualizar cita
    async updateAppointment(appointmentId, appointmentData) {
        try {
            const [updatedRows] = await Appointment.update(
                appointmentData,
                { 
                    where: { 
                        id: appointmentId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al actualizar cita: ${error.message}`);
        }
    }

    // Cancelar cita
    async cancelAppointment(appointmentId, cancelReason, cancelledBy) {
        try {
            const [updatedRows] = await Appointment.update(
                { 
                    status: 'cancelled',
                    cancelReason: cancelReason,
                    user_updated: cancelledBy
                },
                { 
                    where: { 
                        id: appointmentId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al cancelar cita: ${error.message}`);
        }
    }

    // Confirmar cita
    async confirmAppointment(appointmentId, confirmedBy) {
        try {
            const [updatedRows] = await Appointment.update(
                { 
                    status: 'confirmed',
                    user_updated: confirmedBy
                },
                { 
                    where: { 
                        id: appointmentId,
                        flg_deleted: false,
                        status: 'scheduled'
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al confirmar cita: ${error.message}`);
        }
    }

    // Marcar cita como completada
    async completeAppointment(appointmentId, completedBy) {
        try {
            const [updatedRows] = await Appointment.update(
                { 
                    status: 'completed',
                    user_updated: completedBy
                },
                { 
                    where: { 
                        id: appointmentId,
                        flg_deleted: false,
                        status: { [Op.in]: ['confirmed', 'in_progress'] }
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al completar cita: ${error.message}`);
        }
    }

    // Buscar citas con paginación
    async findWithPagination(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            
            const whereClause = {
                flg_deleted: false
            };

            // Aplicar filtros
            if (filters.patientId) {
                whereClause.patientId = filters.patientId;
            }

            if (filters.doctorId) {
                whereClause.doctorId = filters.doctorId;
            }

            if (filters.status) {
                whereClause.status = filters.status;
            }

            if (filters.dateFrom && filters.dateTo) {
                whereClause.appointmentDate = {
                    [Op.between]: [filters.dateFrom, filters.dateTo]
                };
            }

            if (filters.search) {
                whereClause[Op.or] = [
                    { reason: { [Op.like]: `%${filters.search}%` } },
                    { notes: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            const { count, rows } = await Appointment.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Patient,
                        as: 'patient',
                        attributes: ['id', 'dni', 'firstName', 'lastName', 'phone']
                    },
                    {
                        model: Doctor,
                        as: 'doctor',
                        attributes: ['id', 'firstName', 'lastName', 'medicalLicense'],
                        include: [{
                            model: Specialty,
                            as: 'specialty',
                            attributes: ['name']
                        }]
                    },
                    {
                        model: AppointmentStatus,
                        as: 'appointmentStatus',
                        attributes: ['name', 'color', 'category']
                    }
                ],
                order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                appointments: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error al buscar citas con paginación: ${error.message}`);
        }
    }

    // Obtener estadísticas de citas
    async getAppointmentStats(filters = {}) {
        try {
            const whereClause = { flg_deleted: false };
            
            if (filters.dateFrom && filters.dateTo) {
                whereClause.appointmentDate = {
                    [Op.between]: [filters.dateFrom, filters.dateTo]
                };
            }

            if (filters.doctorId) {
                whereClause.doctorId = filters.doctorId;
            }

            const totalAppointments = await Appointment.count({ where: whereClause });

            const appointmentsByStatus = await Appointment.findAll({
                attributes: [
                    'status',
                    [Appointment.sequelize.fn('COUNT', Appointment.sequelize.col('id')), 'count']
                ],
                where: whereClause,
                group: ['status']
            });

            const appointmentsByDoctor = await Appointment.findAll({
                attributes: [
                    'doctorId',
                    [Appointment.sequelize.fn('COUNT', Appointment.sequelize.col('Appointment.id')), 'count']
                ],
                where: whereClause,
                include: [{
                    model: Doctor,
                    as: 'doctor',
                    attributes: ['firstName', 'lastName'],
                    include: [{
                        model: Specialty,
                        as: 'specialty',
                        attributes: ['name']
                    }]
                }],
                group: ['doctorId', 'doctor.id', 'doctor->specialty.id']
            });

            const upcomingAppointments = await Appointment.count({
                where: {
                    ...whereClause,
                    appointmentDate: { [Op.gte]: new Date() },
                    status: { [Op.in]: ['scheduled', 'confirmed'] }
                }
            });

            return {
                total: totalAppointments,
                upcoming: upcomingAppointments,
                byStatus: appointmentsByStatus,
                byDoctor: appointmentsByDoctor
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de citas: ${error.message}`);
        }
    }

    // Obtener citas pendientes de recordatorio
    async findPendingReminders() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const appointments = await Appointment.findAll({
                where: {
                    appointmentDate: tomorrow.toISOString().split('T')[0],
                    status: { [Op.in]: ['scheduled', 'confirmed'] },
                    reminderSent: false,
                    flg_deleted: false,
                    active: true
                },
                include: [
                    {
                        model: Patient,
                        as: 'patient',
                        attributes: ['id', 'firstName', 'lastName', 'phone']
                    },
                    {
                        model: Doctor,
                        as: 'doctor',
                        attributes: ['firstName', 'lastName'],
                        include: [{
                            model: Specialty,
                            as: 'specialty',
                            attributes: ['name']
                        }]
                    }
                ]
            });

            return appointments;
        } catch (error) {
            throw new Error(`Error al buscar citas pendientes de recordatorio: ${error.message}`);
        }
    }

    // Marcar recordatorio como enviado
    async markReminderSent(appointmentId) {
        try {
            const [updatedRows] = await Appointment.update(
                { reminderSent: true },
                { 
                    where: { 
                        id: appointmentId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al marcar recordatorio como enviado: ${error.message}`);
        }
    }

    // Soft delete de cita
    async deleteAppointment(appointmentId, deletedBy) {
        try {
            const [updatedRows] = await Appointment.update(
                { 
                    active: false,
                    flg_deleted: true,
                    deleted_at: new Date(),
                    user_deleted: deletedBy
                },
                { 
                    where: { 
                        id: appointmentId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al eliminar cita: ${error.message}`);
        }
    }

    // Reprogramar cita
    async rescheduleAppointment(appointmentId, newDate, newTime, rescheduledBy) {
        try {
            const [updatedRows] = await Appointment.update(
                { 
                    appointmentDate: newDate,
                    appointmentTime: newTime,
                    status: 'scheduled',
                    reminderSent: false,
                    user_updated: rescheduledBy
                },
                { 
                    where: { 
                        id: appointmentId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al reprogramar cita: ${error.message}`);
        }
    }

    // Buscar slots disponibles
    async findAvailableSlots(doctorId, date, duration = 30) {
        try {
            // Obtener horario del doctor para el día de la semana
            const dayOfWeek = new Date(date).getDay();
            
            const schedule = await Schedule.findOne({
                where: {
                    doctorId: doctorId,
                    dayOfWeek: dayOfWeek,
                    isAvailable: true,
                    flg_deleted: false,
                    active: true
                }
            });

            if (!schedule) {
                return [];
            }

            // Obtener citas existentes para ese día
            const existingAppointments = await this.findByDate(date, { doctorId });

            // Generar slots disponibles
            const availableSlots = this.generateTimeSlots(
                schedule.startTime,
                schedule.endTime,
                schedule.breakStart,
                schedule.breakEnd,
                schedule.slotDuration || duration,
                existingAppointments
            );

            return availableSlots;
        } catch (error) {
            throw new Error(`Error al buscar slots disponibles: ${error.message}`);
        }
    }

    // Helper para generar slots de tiempo
    generateTimeSlots(startTime, endTime, breakStart, breakEnd, slotDuration, existingAppointments) {
        const slots = [];
        const start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);
        const breakStartMinutes = breakStart ? this.timeToMinutes(breakStart) : null;
        const breakEndMinutes = breakEnd ? this.timeToMinutes(breakEnd) : null;

        for (let current = start; current < end; current += slotDuration) {
            const slotTime = this.minutesToTime(current);
            
            // Verificar si está en horario de break
            if (breakStartMinutes && breakEndMinutes && 
                current >= breakStartMinutes && current < breakEndMinutes) {
                continue;
            }

            // Verificar si hay conflicto con citas existentes
            const hasConflict = existingAppointments.some(appointment => {
                const appointmentStart = this.timeToMinutes(appointment.appointmentTime);
                const appointmentEnd = appointmentStart + (appointment.duration || 30);
                return current < appointmentEnd && (current + slotDuration) > appointmentStart;
            });

            if (!hasConflict) {
                slots.push({
                    time: slotTime,
                    available: true
                });
            }
        }

        return slots;
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
}

module.exports = new AppointmentRepository();