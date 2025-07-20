const { Schedule, Doctor, Specialty } = require('../../shared/models');
const { Op } = require('sequelize');

class ScheduleRepository {
    
    // Crear un nuevo horario
    async createSchedule(scheduleData) {
        try {
            const schedule = await Schedule.create(scheduleData);
            return schedule;
        } catch (error) {
            throw new Error(`Error al crear horario: ${error.message}`);
        }
    }

    // Buscar horario por ID
    async findById(id) {
        try {
            const schedule = await Schedule.findOne({
                where: { 
                    id: id,
                    flg_deleted: false
                },
                include: [{
                    model: Doctor,
                    as: 'doctor',
                    attributes: ['id', 'firstName', 'lastName', 'medicalLicense'],
                    include: [{
                        model: Specialty,
                        as: 'specialty',
                        attributes: ['id', 'name']
                    }]
                }]
            });
            return schedule;
        } catch (error) {
            throw new Error(`Error al buscar horario por ID: ${error.message}`);
        }
    }

    // Buscar horarios por doctor
    async findByDoctor(doctorId, filters = {}) {
        try {
            const whereClause = {
                doctorId: doctorId,
                flg_deleted: false
            };

            if (filters.dayOfWeek !== undefined) {
                whereClause.dayOfWeek = filters.dayOfWeek;
            }

            if (filters.isAvailable !== undefined) {
                whereClause.isAvailable = filters.isAvailable;
            }

            if (filters.scheduleType) {
                whereClause.scheduleType = filters.scheduleType;
            }

            if (filters.validDate) {
                whereClause[Op.or] = [
                    { validFrom: null, validTo: null },
                    { 
                        validFrom: { [Op.lte]: filters.validDate },
                        validTo: { [Op.gte]: filters.validDate }
                    },
                    { 
                        validFrom: { [Op.lte]: filters.validDate },
                        validTo: null
                    }
                ];
            }

            const schedules = await Schedule.findAll({
                where: whereClause,
                include: [{
                    model: Doctor,
                    as: 'doctor',
                    attributes: ['firstName', 'lastName', 'medicalLicense']
                }],
                order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
            });
            
            return schedules;
        } catch (error) {
            throw new Error(`Error al buscar horarios por doctor: ${error.message}`);
        }
    }

    // Buscar horario específico por doctor y día
    async findByDoctorAndDay(doctorId, dayOfWeek, validDate = null) {
        try {
            const whereClause = {
                doctorId: doctorId,
                dayOfWeek: dayOfWeek,
                flg_deleted: false,
                active: true,
                isAvailable: true
            };

            if (validDate) {
                whereClause[Op.or] = [
                    { validFrom: null, validTo: null },
                    { 
                        validFrom: { [Op.lte]: validDate },
                        validTo: { [Op.gte]: validDate }
                    },
                    { 
                        validFrom: { [Op.lte]: validDate },
                        validTo: null
                    }
                ];
            }

            const schedule = await Schedule.findOne({
                where: whereClause,
                include: [{
                    model: Doctor,
                    as: 'doctor',
                    attributes: ['firstName', 'lastName', 'medicalLicense']
                }]
            });
            
            return schedule;
        } catch (error) {
            throw new Error(`Error al buscar horario por doctor y día: ${error.message}`);
        }
    }

    // Verificar conflictos de horarios
    async checkScheduleConflict(doctorId, dayOfWeek, startTime, endTime, excludeId = null, validFrom = null, validTo = null) {
        try {
            const whereClause = {
                doctorId: doctorId,
                dayOfWeek: dayOfWeek,
                flg_deleted: false,
                active: true,
                [Op.or]: [
                    // Nuevo horario se superpone con horario existente
                    {
                        startTime: { [Op.lt]: endTime },
                        endTime: { [Op.gt]: startTime }
                    }
                ]
            };

            if (excludeId) {
                whereClause.id = { [Op.ne]: excludeId };
            }

            // Verificar superposición de fechas de validez
            if (validFrom || validTo) {
                const dateConditions = [];
                
                if (validFrom && validTo) {
                    dateConditions.push({
                        [Op.or]: [
                            { validFrom: null, validTo: null },
                            {
                                validFrom: { [Op.lte]: validTo },
                                validTo: { [Op.gte]: validFrom }
                            },
                            {
                                validFrom: { [Op.lte]: validTo },
                                validTo: null
                            }
                        ]
                    });
                } else if (validFrom) {
                    dateConditions.push({
                        [Op.or]: [
                            { validTo: null },
                            { validTo: { [Op.gte]: validFrom } }
                        ]
                    });
                } else if (validTo) {
                    dateConditions.push({
                        [Op.or]: [
                            { validFrom: null },
                            { validFrom: { [Op.lte]: validTo } }
                        ]
                    });
                }

                if (dateConditions.length > 0) {
                    whereClause[Op.and] = dateConditions;
                }
            }

            const conflicts = await Schedule.findAll({ where: whereClause });
            return conflicts.length > 0;
        } catch (error) {
            throw new Error(`Error al verificar conflictos de horario: ${error.message}`);
        }
    }

    // Actualizar horario
    async updateSchedule(scheduleId, scheduleData) {
        try {
            const [updatedRows] = await Schedule.update(
                scheduleData,
                { 
                    where: { 
                        id: scheduleId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al actualizar horario: ${error.message}`);
        }
    }

    // Activar/Desactivar horario
    async toggleAvailability(scheduleId, isAvailable, updatedBy) {
        try {
            const [updatedRows] = await Schedule.update(
                { 
                    isAvailable: isAvailable,
                    user_updated: updatedBy
                },
                { 
                    where: { 
                        id: scheduleId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al cambiar disponibilidad del horario: ${error.message}`);
        }
    }

    // Soft delete de horario
    async deleteSchedule(scheduleId, deletedBy) {
        try {
            const [updatedRows] = await Schedule.update(
                { 
                    active: false,
                    flg_deleted: true,
                    deleted_at: new Date(),
                    user_deleted: deletedBy
                },
                { 
                    where: { 
                        id: scheduleId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al eliminar horario: ${error.message}`);
        }
    }

    // Buscar horarios con paginación
    async findWithPagination(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            
            const whereClause = {
                flg_deleted: false
            };

            // Aplicar filtros
            if (filters.doctorId) {
                whereClause.doctorId = filters.doctorId;
            }

            if (filters.dayOfWeek !== undefined) {
                whereClause.dayOfWeek = filters.dayOfWeek;
            }

            if (filters.isAvailable !== undefined) {
                whereClause.isAvailable = filters.isAvailable;
            }

            if (filters.scheduleType) {
                whereClause.scheduleType = filters.scheduleType;
            }

            const { count, rows } = await Schedule.findAndCountAll({
                where: whereClause,
                include: [{
                    model: Doctor,
                    as: 'doctor',
                    attributes: ['id', 'firstName', 'lastName', 'medicalLicense'],
                    include: [{
                        model: Specialty,
                        as: 'specialty',
                        attributes: ['name']
                    }]
                }],
                order: [['doctorId', 'ASC'], ['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                schedules: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error al buscar horarios con paginación: ${error.message}`);
        }
    }

    // Obtener estadísticas de horarios
    async getScheduleStats(filters = {}) {
        try {
            const whereClause = { flg_deleted: false };

            if (filters.doctorId) {
                whereClause.doctorId = filters.doctorId;
            }

            const totalSchedules = await Schedule.count({ where: whereClause });

            const availableSchedules = await Schedule.count({
                where: { ...whereClause, isAvailable: true, active: true }
            });

            const schedulesByType = await Schedule.findAll({
                attributes: [
                    'scheduleType',
                    [Schedule.sequelize.fn('COUNT', Schedule.sequelize.col('id')), 'count']
                ],
                where: whereClause,
                group: ['scheduleType']
            });

            const schedulesByDoctor = await Schedule.findAll({
                attributes: [
                    'doctorId',
                    [Schedule.sequelize.fn('COUNT', Schedule.sequelize.col('Schedule.id')), 'count']
                ],
                where: whereClause,
                include: [{
                    model: Doctor,
                    as: 'doctor',
                    attributes: ['firstName', 'lastName']
                }],
                group: ['doctorId', 'doctor.id']
            });

            return {
                total: totalSchedules,
                available: availableSchedules,
                unavailable: totalSchedules - availableSchedules,
                byType: schedulesByType,
                byDoctor: schedulesByDoctor
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de horarios: ${error.message}`);
        }
    }

    // Obtener horarios activos por doctor
    async findActiveByDoctor(doctorId) {
        try {
            const schedules = await Schedule.findAll({
                where: {
                    doctorId: doctorId,
                    flg_deleted: false,
                    active: true,
                    isAvailable: true
                },
                order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
            });
            
            return schedules;
        } catch (error) {
            throw new Error(`Error al buscar horarios activos por doctor: ${error.message}`);
        }
    }

    // Clonar horario para múltiples días
    async cloneSchedule(scheduleId, targetDays, createdBy) {
        try {
            const originalSchedule = await this.findById(scheduleId);
            if (!originalSchedule) {
                throw new Error('Horario original no encontrado');
            }

            const clonedSchedules = [];
            
            for (const dayOfWeek of targetDays) {
                const scheduleData = {
                    doctorId: originalSchedule.doctorId,
                    dayOfWeek: dayOfWeek,
                    startTime: originalSchedule.startTime,
                    endTime: originalSchedule.endTime,
                    isAvailable: originalSchedule.isAvailable,
                    breakStart: originalSchedule.breakStart,
                    breakEnd: originalSchedule.breakEnd,
                    slotDuration: originalSchedule.slotDuration,
                    maxPatientsPerSlot: originalSchedule.maxPatientsPerSlot,
                    scheduleType: originalSchedule.scheduleType,
                    validFrom: originalSchedule.validFrom,
                    validTo: originalSchedule.validTo,
                    isRecurring: originalSchedule.isRecurring,
                    notes: originalSchedule.notes,
                    user_created: createdBy
                };

                const cloned = await this.createSchedule(scheduleData);
                clonedSchedules.push(cloned);
            }

            return clonedSchedules;
        } catch (error) {
            throw new Error(`Error al clonar horario: ${error.message}`);
        }
    }

    // Buscar médicos disponibles en un día y hora específicos
    async findAvailableDoctors(dayOfWeek, time, date = null, specialtyId = null) {
        try {
            const whereClause = {
                dayOfWeek: dayOfWeek,
                startTime: { [Op.lte]: time },
                endTime: { [Op.gte]: time },
                isAvailable: true,
                flg_deleted: false,
                active: true
            };

            // Verificar que no esté en horario de break
            whereClause[Op.or] = [
                { breakStart: null, breakEnd: null },
                {
                    [Op.not]: {
                        [Op.and]: [
                            { breakStart: { [Op.lte]: time } },
                            { breakEnd: { [Op.gte]: time } }
                        ]
                    }
                }
            ];

            // Filtro de fecha de validez
            if (date) {
                whereClause[Op.and] = [
                    {
                        [Op.or]: [
                            { validFrom: null, validTo: null },
                            { 
                                validFrom: { [Op.lte]: date },
                                validTo: { [Op.gte]: date }
                            },
                            { 
                                validFrom: { [Op.lte]: date },
                                validTo: null
                            }
                        ]
                    }
                ];
            }

            const includeOptions = [{
                model: Doctor,
                as: 'doctor',
                attributes: ['id', 'firstName', 'lastName', 'medicalLicense'],
                include: [{
                    model: Specialty,
                    as: 'specialty',
                    attributes: ['id', 'name']
                }]
            }];

            // Filtro por especialidad
            if (specialtyId) {
                includeOptions[0].include[0].where = { id: specialtyId };
            }

            const schedules = await Schedule.findAll({
                where: whereClause,
                include: includeOptions,
                order: [['doctor', 'firstName', 'ASC']]
            });
            
            return schedules;
        } catch (error) {
            throw new Error(`Error al buscar médicos disponibles: ${error.message}`);
        }
    }

    // Obtener resumen semanal de horarios por doctor
    async getWeeklyScheduleSummary(doctorId, weekStartDate = null) {
        try {
            const whereClause = {
                doctorId: doctorId,
                flg_deleted: false,
                active: true
            };

            if (weekStartDate) {
                const weekEndDate = new Date(weekStartDate);
                weekEndDate.setDate(weekEndDate.getDate() + 6);
                
                whereClause[Op.or] = [
                    { validFrom: null, validTo: null },
                    { 
                        validFrom: { [Op.lte]: weekEndDate },
                        validTo: { [Op.gte]: weekStartDate }
                    },
                    { 
                        validFrom: { [Op.lte]: weekEndDate },
                        validTo: null
                    }
                ];
            }

            const schedules = await Schedule.findAll({
                where: whereClause,
                order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
            });

            // Organizar por día de la semana
            const weeklySchedule = {
                0: [], // Domingo
                1: [], // Lunes
                2: [], // Martes
                3: [], // Miércoles
                4: [], // Jueves
                5: [], // Viernes
                6: []  // Sábado
            };

            schedules.forEach(schedule => {
                weeklySchedule[schedule.dayOfWeek].push(schedule);
            });

            return weeklySchedule;
        } catch (error) {
            throw new Error(`Error al obtener resumen semanal: ${error.message}`);
        }
    }
}

module.exports = new ScheduleRepository();