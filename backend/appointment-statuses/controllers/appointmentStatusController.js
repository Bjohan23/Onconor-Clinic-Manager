const appointmentStatusRepository = require('../repositories/appointmentStatusRepository');
const { apiResponse } = require('../../shared/helpers/apiResponseHelper');

class AppointmentStatusController {
    
    // Crear nuevo estado de cita
    async createAppointmentStatus(req, res) {
        try {
            const statusData = req.body;

            // Verificar que no existe un estado con el mismo nombre
            const existingStatus = await appointmentStatusRepository.findByName(statusData.name);
            if (existingStatus) {
                return apiResponse.conflict(res, 'Ya existe un estado con este nombre');
            }

            // Agregar información de auditoría
            statusData.user_created = req.user.userId;

            const status = await appointmentStatusRepository.createAppointmentStatus(statusData);

            return apiResponse.success(res, 'Estado de cita creado exitosamente', { status });

        } catch (error) {
            console.error('Error al crear estado de cita:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener estado por ID
    async getAppointmentStatusById(req, res) {
        try {
            const { id } = req.params;

            const status = await appointmentStatusRepository.findById(id);
            if (!status) {
                return apiResponse.notFound(res, 'Estado de cita no encontrado');
            }

            return apiResponse.success(res, 'Estado obtenido exitosamente', { status });

        } catch (error) {
            console.error('Error al obtener estado:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Actualizar estado
    async updateAppointmentStatus(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validar que el estado existe
            const existingStatus = await appointmentStatusRepository.findById(id);
            if (!existingStatus) {
                return apiResponse.notFound(res, 'Estado no encontrado');
            }

            // Verificar conflicto con el nombre
            if (updateData.name) {
                const statusWithName = await appointmentStatusRepository.findByName(updateData.name);
                if (statusWithName && statusWithName.id !== parseInt(id)) {
                    return apiResponse.conflict(res, 'Ya existe un estado con este nombre');
                }
            }

            // Agregar información de auditoría
            updateData.user_updated = req.user.userId;

            // No permitir actualizar ciertos campos
            delete updateData.id;
            delete updateData.created_at;
            delete updateData.updated_at;
            delete updateData.flg_deleted;
            delete updateData.deleted_at;

            const updated = await appointmentStatusRepository.updateAppointmentStatus(id, updateData);
            if (!updated) {
                return apiResponse.error(res, 'Error al actualizar estado');
            }

            const updatedStatus = await appointmentStatusRepository.findById(id);

            return apiResponse.success(res, 'Estado actualizado exitosamente', { 
                status: updatedStatus 
            });

        } catch (error) {
            console.error('Error al actualizar estado:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Listar estados activos
    async getActiveStatuses(req, res) {
        try {
            const filters = {
                search: req.query.search,
                category: req.query.category
            };

            const statuses = await appointmentStatusRepository.findAllActive(filters);

            return apiResponse.success(res, 'Estados obtenidos exitosamente', { 
                statuses,
                total: statuses.length 
            });

        } catch (error) {
            console.error('Error al obtener estados activos:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Listar todos los estados
    async getAllStatuses(req, res) {
        try {
            const filters = {
                search: req.query.search,
                category: req.query.category,
                isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
            };

            const statuses = await appointmentStatusRepository.findAll(filters);

            return apiResponse.success(res, 'Estados obtenidos exitosamente', { 
                statuses,
                total: statuses.length 
            });

        } catch (error) {
            console.error('Error al obtener todos los estados:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Listar con paginación
    async getStatusesWithPagination(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                search: req.query.search,
                category: req.query.category,
                isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
            };

            const result = await appointmentStatusRepository.findWithPagination(page, limit, filters);

            return apiResponse.success(res, 'Estados obtenidos exitosamente', result);

        } catch (error) {
            console.error('Error al obtener estados con paginación:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener estados por categoría
    async getStatusesByCategory(req, res) {
        try {
            const { category } = req.params;

            const validCategories = ['active', 'completed', 'cancelled', 'pending'];
            if (!validCategories.includes(category)) {
                return apiResponse.badRequest(res, 'Categoría no válida');
            }

            const statuses = await appointmentStatusRepository.findByCategory(category);

            return apiResponse.success(res, 'Estados obtenidos exitosamente', { 
                category,
                statuses,
                total: statuses.length 
            });

        } catch (error) {
            console.error('Error al obtener estados por categoría:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Desactivar estado
    async deactivateAppointmentStatus(req, res) {
        try {
            const { id } = req.params;

            const status = await appointmentStatusRepository.findById(id);
            if (!status) {
                return apiResponse.notFound(res, 'Estado no encontrado');
            }

            // No permitir desactivar si es el estado por defecto
            if (status.isDefault) {
                return apiResponse.badRequest(res, 'No se puede desactivar el estado por defecto');
            }

            const deactivated = await appointmentStatusRepository.deactivateAppointmentStatus(id, req.user.userId);
            if (!deactivated) {
                return apiResponse.error(res, 'Error al desactivar estado');
            }

            return apiResponse.success(res, 'Estado desactivado exitosamente');

        } catch (error) {
            console.error('Error al desactivar estado:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Activar estado
    async activateAppointmentStatus(req, res) {
        try {
            const { id } = req.params;

            const status = await appointmentStatusRepository.findById(id);
            if (!status) {
                return apiResponse.notFound(res, 'Estado no encontrado');
            }

            const activated = await appointmentStatusRepository.activateAppointmentStatus(id);
            if (!activated) {
                return apiResponse.error(res, 'Error al activar estado');
            }

            return apiResponse.success(res, 'Estado activado exitosamente');

        } catch (error) {
            console.error('Error al activar estado:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Establecer como estado por defecto
    async setAsDefault(req, res) {
        try {
            const { id } = req.params;

            const status = await appointmentStatusRepository.findById(id);
            if (!status) {
                return apiResponse.notFound(res, 'Estado no encontrado');
            }

            if (!status.isActive) {
                return apiResponse.badRequest(res, 'No se puede establecer como defecto un estado inactivo');
            }

            const result = await appointmentStatusRepository.setAsDefault(id, req.user.userId);
            if (!result) {
                return apiResponse.error(res, 'Error al establecer estado por defecto');
            }

            return apiResponse.success(res, 'Estado establecido como defecto exitosamente');

        } catch (error) {
            console.error('Error al establecer estado por defecto:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Buscar estados
    async searchAppointmentStatuses(req, res) {
        try {
            const { search, category, isActive, page = 1, limit = 10 } = req.query;

            const filters = {};
            if (search) filters.search = search;
            if (category) filters.category = category;
            if (isActive !== undefined) filters.isActive = isActive === 'true';

            if (page && limit) {
                const result = await appointmentStatusRepository.findWithPagination(
                    parseInt(page), 
                    parseInt(limit), 
                    filters
                );
                return apiResponse.success(res, 'Búsqueda completada exitosamente', result);
            } else {
                const statuses = filters.isActive !== undefined ? 
                    await appointmentStatusRepository.findAll(filters) :
                    await appointmentStatusRepository.findAllActive(filters);
                
                return apiResponse.success(res, 'Búsqueda completada exitosamente', {
                    statuses,
                    total: statuses.length
                });
            }

        } catch (error) {
            console.error('Error en búsqueda de estados:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener estadísticas
    async getStatusStats(req, res) {
        try {
            const stats = await appointmentStatusRepository.getAppointmentStatusStats();

            return apiResponse.success(res, 'Estadísticas obtenidas exitosamente', { stats });

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Verificar disponibilidad de nombre
    async checkNameAvailability(req, res) {
        try {
            const { name } = req.params;
            const { excludeId } = req.query;

            const exists = await appointmentStatusRepository.checkStatusExists(name, excludeId);

            return apiResponse.success(res, 'Verificación completada', {
                available: !exists,
                exists: exists
            });

        } catch (error) {
            console.error('Error al verificar disponibilidad de nombre:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }
}

module.exports = new AppointmentStatusController();