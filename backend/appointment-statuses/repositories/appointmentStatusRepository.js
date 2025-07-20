const { AppointmentStatus, Appointment } = require('../../shared/models');
const { Op } = require('sequelize');

class AppointmentStatusRepository {
    
    // Crear un nuevo estado de cita
    async createAppointmentStatus(statusData) {
        try {
            const status = await AppointmentStatus.create(statusData);
            return status;
        } catch (error) {
            throw new Error(`Error al crear estado de cita: ${error.message}`);
        }
    }

    // Buscar estado por ID
    async findById(id) {
        try {
            const status = await AppointmentStatus.findOne({
                where: { 
                    id: id,
                    flg_deleted: false
                }
            });
            return status;
        } catch (error) {
            throw new Error(`Error al buscar estado por ID: ${error.message}`);
        }
    }

    // Buscar estado por nombre
    async findByName(name) {
        try {
            const status = await AppointmentStatus.findOne({
                where: { 
                    name: name,
                    flg_deleted: false
                }
            });
            return status;
        } catch (error) {
            throw new Error(`Error al buscar estado por nombre: ${error.message}`);
        }
    }

    // Buscar estados por categoría
    async findByCategory(category) {
        try {
            const statuses = await AppointmentStatus.findAll({
                where: { 
                    category: category,
                    flg_deleted: false,
                    isActive: true
                },
                order: [['sortOrder', 'ASC'], ['name', 'ASC']]
            });
            return statuses;
        } catch (error) {
            throw new Error(`Error al buscar estados por categoría: ${error.message}`);
        }
    }

    // Actualizar estado
    async updateAppointmentStatus(statusId, statusData) {
        try {
            const [updatedRows] = await AppointmentStatus.update(
                statusData,
                { 
                    where: { 
                        id: statusId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al actualizar estado: ${error.message}`);
        }
    }

    // Desactivar estado (soft delete)
    async deactivateAppointmentStatus(statusId, deletedBy) {
        try {
            const [updatedRows] = await AppointmentStatus.update(
                { 
                    isActive: false,
                    flg_deleted: true,
                    deleted_at: new Date(),
                    user_deleted: deletedBy
                },
                { 
                    where: { 
                        id: statusId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al desactivar estado: ${error.message}`);
        }
    }

    // Activar estado
    async activateAppointmentStatus(statusId) {
        try {
            const [updatedRows] = await AppointmentStatus.update(
                { 
                    isActive: true,
                    flg_deleted: false,
                    deleted_at: null
                },
                { 
                    where: { id: statusId }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al activar estado: ${error.message}`);
        }
    }

    // Listar estados activos
    async findAllActive(filters = {}) {
        try {
            const whereClause = {
                flg_deleted: false,
                isActive: true
            };

            // Aplicar filtros
            if (filters.search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${filters.search}%` } },
                    { description: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            if (filters.category) {
                whereClause.category = filters.category;
            }

            const statuses = await AppointmentStatus.findAll({
                where: whereClause,
                order: [['sortOrder', 'ASC'], ['name', 'ASC']]
            });
            
            return statuses;
        } catch (error) {
            throw new Error(`Error al listar estados activos: ${error.message}`);
        }
    }

    // Listar todos los estados
    async findAll(filters = {}) {
        try {
            const whereClause = {
                flg_deleted: false
            };

            // Aplicar filtros
            if (filters.search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${filters.search}%` } },
                    { description: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            if (filters.category) {
                whereClause.category = filters.category;
            }

            if (filters.isActive !== undefined) {
                whereClause.isActive = filters.isActive;
            }

            const statuses = await AppointmentStatus.findAll({
                where: whereClause,
                order: [['sortOrder', 'ASC'], ['name', 'ASC']]
            });
            
            return statuses;
        } catch (error) {
            throw new Error(`Error al listar todos los estados: ${error.message}`);
        }
    }

    // Buscar con paginación
    async findWithPagination(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            
            const whereClause = {
                flg_deleted: false
            };

            // Aplicar filtros
            if (filters.search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${filters.search}%` } },
                    { description: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            if (filters.category) {
                whereClause.category = filters.category;
            }

            if (filters.isActive !== undefined) {
                whereClause.isActive = filters.isActive;
            }

            const { count, rows } = await AppointmentStatus.findAndCountAll({
                where: whereClause,
                order: [['sortOrder', 'ASC'], ['name', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                statuses: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error al buscar estados con paginación: ${error.message}`);
        }
    }

    // Verificar si existe estado con nombre
    async checkStatusExists(name, excludeId = null) {
        try {
            const whereClause = {
                name: name,
                flg_deleted: false
            };

            if (excludeId) {
                whereClause.id = { [Op.ne]: excludeId };
            }

            const status = await AppointmentStatus.findOne({ where: whereClause });
            return status !== null;
        } catch (error) {
            throw new Error(`Error al verificar existencia de estado: ${error.message}`);
        }
    }

    // Establecer como estado por defecto
    async setAsDefault(statusId, updatedBy) {
        try {
            // Primero quitar el default de todos los estados
            await AppointmentStatus.update(
                { 
                    isDefault: false,
                    user_updated: updatedBy
                },
                { 
                    where: { 
                        flg_deleted: false,
                        isDefault: true
                    }
                }
            );

            // Luego establecer el nuevo default
            const [updatedRows] = await AppointmentStatus.update(
                { 
                    isDefault: true,
                    user_updated: updatedBy
                },
                { 
                    where: { 
                        id: statusId,
                        flg_deleted: false,
                        isActive: true
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al establecer estado por defecto: ${error.message}`);
        }
    }

    // Obtener estado por defecto
    async findDefault() {
        try {
            const status = await AppointmentStatus.findOne({
                where: { 
                    isDefault: true,
                    flg_deleted: false,
                    isActive: true
                }
            });
            return status;
        } catch (error) {
            throw new Error(`Error al buscar estado por defecto: ${error.message}`);
        }
    }

    // Obtener estadísticas
    async getAppointmentStatusStats() {
        try {
            const totalStatuses = await AppointmentStatus.count({
                where: { flg_deleted: false }
            });

            const activeStatuses = await AppointmentStatus.count({
                where: { 
                    flg_deleted: false,
                    isActive: true
                }
            });

            const statusesByCategory = await AppointmentStatus.findAll({
                attributes: [
                    'category',
                    [AppointmentStatus.sequelize.fn('COUNT', AppointmentStatus.sequelize.col('id')), 'count']
                ],
                where: { 
                    flg_deleted: false,
                    isActive: true
                },
                group: ['category']
            });

            const statusUsage = await AppointmentStatus.findAll({
                attributes: [
                    'id',
                    'name',
                    [AppointmentStatus.sequelize.fn('COUNT', AppointmentStatus.sequelize.col('appointments.id')), 'appointmentCount']
                ],
                include: [{
                    model: Appointment,
                    as: 'appointments',
                    attributes: [],
                    where: {
                        flg_deleted: false
                    },
                    required: false
                }],
                where: { 
                    flg_deleted: false,
                    isActive: true
                },
                group: ['AppointmentStatus.id']
            });

            const defaultStatus = await this.findDefault();

            return {
                total: totalStatuses,
                active: activeStatuses,
                inactive: totalStatuses - activeStatuses,
                byCategory: statusesByCategory,
                usage: statusUsage,
                defaultStatus: defaultStatus
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    // Obtener estados ordenados para UI
    async findAllForUI() {
        try {
            const statuses = await AppointmentStatus.findAll({
                where: { 
                    flg_deleted: false,
                    isActive: true
                },
                order: [['sortOrder', 'ASC'], ['name', 'ASC']]
            });

            return statuses.map(status => ({
                id: status.id,
                name: status.name,
                description: status.description,
                color: status.color,
                category: status.category,
                isDefault: status.isDefault,
                allowBooking: status.allowBooking,
                allowCancellation: status.allowCancellation,
                allowRescheduling: status.allowRescheduling
            }));
        } catch (error) {
            throw new Error(`Error al obtener estados para UI: ${error.message}`);
        }
    }

    // Reordenar estados
    async reorderStatuses(statusOrders, updatedBy) {
        try {
            const updates = statusOrders.map(({ id, sortOrder }) => {
                return AppointmentStatus.update(
                    { 
                        sortOrder: sortOrder,
                        user_updated: updatedBy
                    },
                    { 
                        where: { 
                            id: id,
                            flg_deleted: false
                        }
                    }
                );
            });

            await Promise.all(updates);
            return true;
        } catch (error) {
            throw new Error(`Error al reordenar estados: ${error.message}`);
        }
    }

    // Buscar estados permitidos para booking
    async findBookingAllowed() {
        try {
            const statuses = await AppointmentStatus.findAll({
                where: { 
                    flg_deleted: false,
                    isActive: true,
                    allowBooking: true
                },
                order: [['sortOrder', 'ASC'], ['name', 'ASC']]
            });
            return statuses;
        } catch (error) {
            throw new Error(`Error al buscar estados permitidos para booking: ${error.message}`);
        }
    }

    // Buscar estados que permiten cancelación
    async findCancellationAllowed() {
        try {
            const statuses = await AppointmentStatus.findAll({
                where: { 
                    flg_deleted: false,
                    isActive: true,
                    allowCancellation: true
                },
                order: [['sortOrder', 'ASC'], ['name', 'ASC']]
            });
            return statuses;
        } catch (error) {
            throw new Error(`Error al buscar estados que permiten cancelación: ${error.message}`);
        }
    }

    // Buscar estados que permiten reprogramación
    async findReschedulingAllowed() {
        try {
            const statuses = await AppointmentStatus.findAll({
                where: { 
                    flg_deleted: false,
                    isActive: true,
                    allowRescheduling: true
                },
                order: [['sortOrder', 'ASC'], ['name', 'ASC']]
            });
            return statuses;
        } catch (error) {
            throw new Error(`Error al buscar estados que permiten reprogramación: ${error.message}`);
        }
    }
}

module.exports = new AppointmentStatusRepository();