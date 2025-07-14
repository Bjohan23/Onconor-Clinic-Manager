const { Appointment, Patient, Doctor, Specialty, User } = require('../../shared/models');
const { Op } = require('sequelize');

class AppointmentRepository {
    
    // Crear una nueva cita
    async createAppointment(appointmentData) {
        try {
            const appointment = await Appointment().create(appointmentData);
            return appointment;
        } catch (error) {
            throw new Error(`Error al crear cita: ${error.message}`);
        }
    }

    // Buscar cita por ID
    async findById(id) {
        try {
            const appointment = await Appointment().findOne({
                where: { 
                    id: id,
                    flg_deleted: false
                },
                include: [
                    {
                        model: Patient(),
                        as: 'patient',
                        include: [{
                            model: User(),
                            as: 'user',
                            attributes: { exclude: ['password'] }
                        }]
                    },
                    {
                        model: Doctor(),
                        as: 'doctor',
                        include: [
                            {
                                model: User(),
                                as: 'user',
                                attributes: { exclude: ['password'] }
                            },
                            {
                                model: Specialty(),
                                as: 'specialty'
                            }
                        ]
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
                flg_deleted: false,
                active: true
            };

            if (filters.status) {
                whereClause.status = filters.status;
            }

            if (filters.dateFrom) {
                whereClause.appointmentDate = {
                    [Op.gte]: filters.dateFrom
                };
            }

            if (filters.dateTo) {
                whereClause.appointmentDate = {
                    ...whereClause.appointmentDate,
                    [Op.lte]: filters.dateTo
                };
            }

            const appointments = await Appointment().findAll({
                where: whereClause,
                include: [
                    {
                        model: Doctor(),
                        as: 'doctor',
                        include: [{
                            model: Specialty(),
                            as: 'specialty'
                        }]
                    }
                ],
                order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
            });
            
            return appointments;
        } catch (error) {
            throw new Error(`Error al buscar citas por paciente: ${error.message}`);
        }
    }

    // Buscar citas por médico
    async findByDoctor(doctorId, filters = {}) {
        try {
            const whereClause = {
                doctorId: doctorId,
                flg_deleted: false,
                active: true
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

            const appointments = await Appointment().findAll({
                where: whereClause,
                include: [
                    {
                        model: Patient(),
                        as: 'patient',
                        include: [{
                            model: User(),
                            as: 'user',
                            attributes: { exclude: ['password'] }
                        }]
                    }
                ],
                order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
            });
            
            return appointments;
        } catch (error) {
            throw new Error(`Error al buscar citas por médico: ${error.message}`);
        }
    }

    // Buscar citas por fecha y médico (para verificar disponibilidad)
    async findByDateAndDoctor(date, doctorId) {
        try {
            const appointments = await Appointment().findAll({
                where: {
                    appointmentDate: date,
                    doctorId: doctorId,
                    flg_deleted: false,
                    active: true,
                    status: {
                        [Op.notIn]: ['cancelled', 'no_show']
                    }
                },
                order: [['appointmentTime', 'ASC']]
            });
            
            return appointments;
        } catch (error) {
            throw new Error(`Error al buscar citas por fecha y médico: ${error.message}`);
        }
    }

    // Actualizar cita
    async updateAppointment(appointmentId, appointmentData) {
        try {
            const [updatedRows] = await Appointment().update(
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
    async cancelAppointment(appointmentId, cancelledBy, reason = null) {
        try {
            const updateData = { 
                status: 'cancelled',
                user_updated: cancelledBy
            };

            if (reason) {
                updateData.notes = reason ? `Cancelada: ${reason}` : 'Cancelada';
            }

            const [updatedRows] = await Appointment().update(
                updateData,
                { 
                    where: { 
                        id: appointmentId,
                        flg_deleted: false,
                        status: {
                            [Op.notIn]: ['completed', 'cancelled']
                        }
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
            const [updatedRows] = await Appointment().update(
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
    async completeAppointment(appointmentId, completedBy, notes = null) {
        try {
            const updateData = { 
                status: 'completed',
                user_updated: completedBy
            };

            if (notes) {
                updateData.notes = notes;
            }

            const [updatedRows] = await Appointment().update(
                updateData,
                { 
                    where: { 
                        id: appointmentId,
                        flg_deleted: false,
                        status: {
                            [Op.in]: ['confirmed', 'in_progress']
                        }
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
                flg_deleted: false,
                active: true
            };

            // Aplicar filtros
            if (filters.status) {
                whereClause.status = filters.status;
            }

            if (filters.doctorId) {
                whereClause.doctorId = filters.doctorId;
            }

            if (filters.patientId) {
                whereClause.patientId = filters.patientId;
            }

            if (filters.dateFrom && filters.dateTo) {
                whereClause.appointmentDate = {
                    [Op.between]: [filters.dateFrom, filters.dateTo]
                };
            }

            if (filters.search) {
                // Buscar en reason o notes
                whereClause[Op.or] = [
                    { reason: { [Op.like]: `%${filters.search}%` } },
                    { notes: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            const { count, rows } = await Appointment().findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Patient(),
                        as: 'patient',
                        include: [{
                            model: User(),
                            as: 'user',
                            attributes: { exclude: ['password'] }
                        }]
                    },
                    {
                        model: Doctor(),
                        as: 'doctor',
                        include: [
                            {
                                model: User(),
                                as: 'user',
                                attributes: { exclude: ['password'] }
                            },
                            {
                                model: Specialty(),
                                as: 'specialty'
                            }
                        ]
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

    // Verificar conflictos de horario
    async checkTimeConflict(doctorId, date, startTime, endTime, excludeAppointmentId = null) {
        try {
            const whereClause = {
                doctorId: doctorId,
                appointmentDate: date,
                flg_deleted: false,
                active: true,
                status: {
                    [Op.notIn]: ['cancelled', 'no_show']
                }
            };

            if (excludeAppointmentId) {
                whereClause.id = { [Op.ne]: excludeAppointmentId };
            }

            const conflictingAppointments = await Appointment().findAll({
                where: whereClause
            });

            // Verificar conflictos manualmente
            for (const appointment of conflictingAppointments) {
                const appointmentStart = appointment.appointmentTime;
                const appointmentEnd = this.calculateEndTime(appointmentStart, appointment.estimatedDuration || 30);
                
                if (this.timeOverlaps(startTime, endTime, appointmentStart, appointmentEnd)) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            throw new Error(`Error al verificar conflictos de horario: ${error.message}`);
        }
    }

    // Función auxiliar para calcular hora de fin
    calculateEndTime(startTime, durationMinutes) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + durationMinutes;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    }

    // Función auxiliar para verificar solapamiento de horarios
    timeOverlaps(start1, end1, start2, end2) {
        return start1 < end2 && end1 > start2;
    }

    // Obtener estadísticas de citas
    async getAppointmentStats() {
        try {
            const AppointmentModel = Appointment();
            
            const totalAppointments = await AppointmentModel.count({
                where: { flg_deleted: false }
            });

            const appointmentsByStatus = await AppointmentModel.findAll({
                attributes: [
                    'status',
                    [AppointmentModel.sequelize.fn('COUNT', AppointmentModel.sequelize.col('id')), 'count']
                ],
                where: { 
                    flg_deleted: false,
                    active: true
                },
                group: ['status'],
                raw: true
            });

            const todaysAppointments = await AppointmentModel.count({
                where: {
                    appointmentDate: new Date().toISOString().split('T')[0],
                    flg_deleted: false,
                    active: true
                }
            });

            return {
                total: totalAppointments,
                byStatus: appointmentsByStatus,
                today: todaysAppointments
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de citas: ${error.message}`);
        }
    }

    // Buscar citas próximas (para notificaciones)
    async findUpcomingAppointments(hoursAhead = 24) {
        try {
            const now = new Date();
            const today = now.toISOString().split('T')[0];

            const appointments = await Appointment().findAll({
                where: {
                    appointmentDate: {
                        [Op.gte]: today
                    },
                    status: {
                        [Op.in]: ['scheduled', 'confirmed']
                    },
                    flg_deleted: false,
                    active: true
                },
                include: [
                    {
                        model: Patient(),
                        as: 'patient',
                        include: [{
                            model: User(),
                            as: 'user',
                            attributes: { exclude: ['password'] }
                        }]
                    },
                    {
                        model: Doctor(),
                        as: 'doctor',
                        include: [{
                            model: User(),
                            as: 'user',
                            attributes: { exclude: ['password'] }
                        }]
                    }
                ],
                order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
            });

            return appointments;
        } catch (error) {
            throw new Error(`Error al buscar citas próximas: ${error.message}`);
        }
    }
}

module.exports = new AppointmentRepository();