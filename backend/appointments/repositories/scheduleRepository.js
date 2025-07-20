const { sequelize } = require('../../config/database');
const { Op } = require('sequelize');

class ScheduleRepository {
    
    constructor() {
        this.getModel = () => {
            return sequelize.models.schedules;
        };
    }

    async create(scheduleData) {
        try {
            const Schedule = this.getModel();
            return await Schedule.create(scheduleData);
        } catch (error) {
            throw new Error(`Error al crear horario: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const Schedule = this.getModel();
            return await Schedule.findOne({
                where: { 
                    id,
                    flg_deleted: false 
                },
                include: [
                    {
                        association: 'doctor',
                        attributes: ['id', 'firstName', 'lastName', 'medicalLicense'],
                        include: [
                            {
                                association: 'specialty',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });
        } catch (error) {
            throw new Error(`Error al buscar horario: ${error.message}`);
        }
    }

    async findByFilters(filters) {
        try {
            const Schedule = this.getModel();
            const where = { flg_deleted: false };

            if (filters.doctorId) where.doctorId = filters.doctorId;
            if (filters.dayOfWeek !== undefined) where.dayOfWeek = filters.dayOfWeek;
            if (filters.isAvailable !== undefined) where.isAvailable = filters.isAvailable;
            if (filters.active !== undefined) where.active = filters.active;

            return await Schedule.findAll({
                where,
                include: [
                    {
                        association: 'doctor',
                        attributes: ['id', 'firstName', 'lastName', 'medicalLicense']
                    }
                ],
                order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error al buscar horarios: ${error.message}`);
        }
    }

    async findAllWithPagination(filters = {}, page = 1, limit = 10) {
        try {
            const Schedule = this.getModel();
            const offset = (page - 1) * limit;
            const where = { flg_deleted: false };

            if (filters.doctorId) where.doctorId = filters.doctorId;
            if (filters.dayOfWeek !== undefined) where.dayOfWeek = filters.dayOfWeek;
            if (filters.isAvailable !== undefined) where.isAvailable = filters.isAvailable;

            const result = await Schedule.findAndCountAll({
                where,
                include: [
                    {
                        association: 'doctor',
                        attributes: ['id', 'firstName', 'lastName', 'medicalLicense'],
                        include: [
                            {
                                association: 'specialty',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ],
                order: [['doctorId', 'ASC'], ['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
                limit,
                offset
            });

            return {
                schedules: result.rows,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(result.count / limit),
                    totalItems: result.count,
                    itemsPerPage: limit
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener horarios paginados: ${error.message}`);
        }
    }

    async update(id, updateData) {
        try {
            const Schedule = this.getModel();
            const [affectedRows] = await Schedule.update(updateData, {
                where: { 
                    id,
                    flg_deleted: false 
                }
            });

            if (affectedRows === 0) {
                return null;
            }

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error al actualizar horario: ${error.message}`);
        }
    }

    async softDelete(id, userId) {
        try {
            const Schedule = this.getModel();
            const [affectedRows] = await Schedule.update({
                flg_deleted: true,
                deleted_at: new Date(),
                user_deleted: userId
            }, {
                where: { 
                    id,
                    flg_deleted: false 
                }
            });

            return affectedRows > 0;
        } catch (error) {
            throw new Error(`Error al eliminar horario: ${error.message}`);
        }
    }

    async findByDoctor(doctorId) {
        try {
            const Schedule = this.getModel();
            return await Schedule.findAll({
                where: { 
                    doctorId,
                    flg_deleted: false,
                    active: true
                },
                order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error al buscar horarios del médico: ${error.message}`);
        }
    }

    async findByDoctorAndDay(doctorId, dayOfWeek) {
        try {
            const Schedule = this.getModel();
            return await Schedule.findAll({
                where: { 
                    doctorId,
                    dayOfWeek,
                    flg_deleted: false,
                    active: true,
                    isAvailable: true
                },
                order: [['startTime', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error al buscar horarios del médico por día: ${error.message}`);
        }
    }

    async findByDateRange(doctorId, startDate, endDate) {
        try {
            const Schedule = this.getModel();
            
            // Obtener días de la semana para el rango de fechas
            const daysOfWeek = this.getDaysOfWeekInRange(startDate, endDate);
            
            return await Schedule.findAll({
                where: { 
                    doctorId,
                    dayOfWeek: {
                        [Op.in]: daysOfWeek
                    },
                    flg_deleted: false,
                    active: true
                },
                order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error al buscar horarios por rango de fechas: ${error.message}`);
        }
    }

    async findConflictingSchedules(doctorId, dayOfWeek, startTime, endTime, excludeId = null) {
        try {
            const Schedule = this.getModel();
            const where = {
                doctorId,
                dayOfWeek,
                flg_deleted: false,
                active: true,
                [Op.or]: [
                    {
                        // Nuevo horario empieza antes de que termine uno existente
                        // y termina después de que empiece uno existente
                        startTime: { [Op.lt]: endTime },
                        endTime: { [Op.gt]: startTime }
                    }
                ]
            };

            if (excludeId) {
                where.id = { [Op.ne]: excludeId };
            }

            return await Schedule.findAll({
                where,
                order: [['startTime', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error al buscar conflictos de horarios: ${error.message}`);
        }
    }

    async bulkCreate(schedulesData) {
        try {
            const Schedule = this.getModel();
            return await Schedule.bulkCreate(schedulesData, {
                returning: true
            });
        } catch (error) {
            throw new Error(`Error al crear horarios en lote: ${error.message}`);
        }
    }

    async getScheduleStats(doctorId = null, startDate = null, endDate = null) {
        try {
            const Schedule = this.getModel();
            const where = { flg_deleted: false };

            if (doctorId) where.doctorId = doctorId;

            const stats = await Schedule.findAll({
                where,
                attributes: [
                    'doctorId',
                    'dayOfWeek',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalSchedules'],
                    [sequelize.fn('SUM', 
                        sequelize.literal('CASE WHEN isAvailable = true THEN 1 ELSE 0 END')
                    ), 'availableSchedules'],
                    [sequelize.fn('AVG', 
                        sequelize.literal('TIME_TO_SEC(TIMEDIFF(endTime, startTime)) / 3600')
                    ), 'avgHoursPerDay']
                ],
                group: ['doctorId', 'dayOfWeek'],
                include: [
                    {
                        association: 'doctor',
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ]
            });

            return stats;
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de horarios: ${error.message}`);
        }
    }

    // Método auxiliar para obtener días de la semana en un rango de fechas
    getDaysOfWeekInRange(startDate, endDate) {
        const daysOfWeek = new Set();
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);

        while (currentDate <= endDateObj) {
            daysOfWeek.add(currentDate.getDay());
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return Array.from(daysOfWeek);
    }
}

module.exports = new ScheduleRepository();