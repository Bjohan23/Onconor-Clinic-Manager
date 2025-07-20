const appointmentRepository = require('../repositories/appointmentRepository');
const appointmentService = require('../services/appointmentService');
const { apiResponse } = require('../../shared/helpers/apiResponseHelper');

class AppointmentController {
    
    // Crear nueva cita
    async createAppointment(req, res) {
        try {
            const appointmentData = req.body;

            // Agregar información de auditoría
            appointmentData.user_created = req.user.userId;

            const appointment = await appointmentService.createAppointmentWithValidation(
                appointmentData, 
                req.user.userId
            );

            return apiResponse.success(res, 'Cita creada exitosamente', { appointment });

        } catch (error) {
            console.error('Error al crear cita:', error);
            
            if (error.message.includes('validación') || 
                error.message.includes('no existe') || 
                error.message.includes('no está disponible')) {
                return apiResponse.badRequest(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener cita por ID
    async getAppointmentById(req, res) {
        try {
            const { id } = req.params;

            const appointment = await appointmentRepository.findById(id);
            if (!appointment) {
                return apiResponse.notFound(res, 'Cita no encontrada');
            }

            return apiResponse.success(res, 'Cita obtenida exitosamente', { appointment });

        } catch (error) {
            console.error('Error al obtener cita:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener citas por paciente
    async getAppointmentsByPatient(req, res) {
        try {
            const { patientId } = req.params;
            const filters = {
                status: req.query.status,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo
            };

            const appointments = await appointmentRepository.findByPatient(patientId, filters);

            return apiResponse.success(res, 'Citas obtenidas exitosamente', { 
                appointments,
                total: appointments.length,
                filters 
            });

        } catch (error) {
            console.error('Error al obtener citas por paciente:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener citas por doctor
    async getAppointmentsByDoctor(req, res) {
        try {
            const { doctorId } = req.params;
            const filters = {
                status: req.query.status,
                date: req.query.date,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo
            };

            const appointments = await appointmentRepository.findByDoctor(doctorId, filters);

            return apiResponse.success(res, 'Citas obtenidas exitosamente', { 
                appointments,
                total: appointments.length,
                filters 
            });

        } catch (error) {
            console.error('Error al obtener citas por doctor:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener citas por fecha
    async getAppointmentsByDate(req, res) {
        try {
            const { date } = req.params;
            const filters = {
                doctorId: req.query.doctorId,
                status: req.query.status
            };

            const appointments = await appointmentRepository.findByDate(date, filters);

            return apiResponse.success(res, 'Citas obtenidas exitosamente', { 
                appointments,
                date,
                total: appointments.length,
                filters 
            });

        } catch (error) {
            console.error('Error al obtener citas por fecha:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Actualizar cita
    async updateAppointment(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // No permitir actualizar ciertos campos sensibles
            delete updateData.id;
            delete updateData.created_at;
            delete updateData.updated_at;
            delete updateData.flg_deleted;
            delete updateData.deleted_at;

            const updatedAppointment = await appointmentService.updateAppointmentWithValidation(
                id, 
                updateData, 
                req.user.userId
            );

            return apiResponse.success(res, 'Cita actualizada exitosamente', { 
                appointment: updatedAppointment 
            });

        } catch (error) {
            console.error('Error al actualizar cita:', error);
            
            if (error.message.includes('no encontrada') || 
                error.message.includes('no se puede modificar')) {
                return apiResponse.badRequest(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Cancelar cita
    async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            const { cancelReason } = req.body;

            if (!cancelReason || cancelReason.trim().length < 5) {
                return apiResponse.badRequest(res, 'Debe proporcionar una razón de cancelación válida');
            }

            const cancelledAppointment = await appointmentService.cancelAppointmentWithValidation(
                id, 
                cancelReason, 
                req.user.userId
            );

            return apiResponse.success(res, 'Cita cancelada exitosamente', { 
                appointment: cancelledAppointment 
            });

        } catch (error) {
            console.error('Error al cancelar cita:', error);
            
            if (error.message.includes('no encontrada') || 
                error.message.includes('ya está')) {
                return apiResponse.badRequest(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Confirmar cita
    async confirmAppointment(req, res) {
        try {
            const { id } = req.params;

            const confirmedAppointment = await appointmentService.confirmAppointmentWithValidation(
                id, 
                req.user.userId
            );

            return apiResponse.success(res, 'Cita confirmada exitosamente', { 
                appointment: confirmedAppointment 
            });

        } catch (error) {
            console.error('Error al confirmar cita:', error);
            
            if (error.message.includes('no encontrada') || 
                error.message.includes('Solo se pueden')) {
                return apiResponse.badRequest(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Completar cita
    async completeAppointment(req, res) {
        try {
            const { id } = req.params;

            const completedAppointment = await appointmentService.completeAppointmentWithValidation(
                id, 
                req.user.userId
            );

            return apiResponse.success(res, 'Cita completada exitosamente', { 
                appointment: completedAppointment 
            });

        } catch (error) {
            console.error('Error al completar cita:', error);
            
            if (error.message.includes('no encontrada') || 
                error.message.includes('Solo se pueden')) {
                return apiResponse.badRequest(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Reprogramar cita
    async rescheduleAppointment(req, res) {
        try {
            const { id } = req.params;
            const { newDate, newTime } = req.body;

            if (!newDate || !newTime) {
                return apiResponse.badRequest(res, 'Nueva fecha y hora son requeridas');
            }

            const rescheduledAppointment = await appointmentService.rescheduleAppointmentWithValidation(
                id, 
                newDate, 
                newTime, 
                req.user.userId
            );

            return apiResponse.success(res, 'Cita reprogramada exitosamente', { 
                appointment: rescheduledAppointment 
            });

        } catch (error) {
            console.error('Error al reprogramar cita:', error);
            
            if (error.message.includes('no encontrada') || 
                error.message.includes('no está disponible') ||
                error.message.includes('no puede ser')) {
                return apiResponse.badRequest(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Buscar citas con filtros
    async searchAppointments(req, res) {
        try {
            const { 
                patientId, doctorId, status, dateFrom, dateTo, search, 
                page = 1, limit = 10 
            } = req.query;

            const filters = {};
            if (patientId) filters.patientId = patientId;
            if (doctorId) filters.doctorId = doctorId;
            if (status) filters.status = status;
            if (dateFrom && dateTo) {
                filters.dateFrom = dateFrom;
                filters.dateTo = dateTo;
            }
            if (search) filters.search = search;

            const pagination = page && limit ? { page: parseInt(page), limit: parseInt(limit) } : null;

            const result = await appointmentService.searchAppointmentsWithBusinessLogic(filters, pagination);

            return apiResponse.success(res, 'Búsqueda completada exitosamente', result);

        } catch (error) {
            console.error('Error en búsqueda de citas:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Listar citas con paginación
    async getAppointmentsWithPagination(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                patientId: req.query.patientId,
                doctorId: req.query.doctorId,
                status: req.query.status,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                search: req.query.search
            };

            const result = await appointmentRepository.findWithPagination(page, limit, filters);

            return apiResponse.success(res, 'Citas obtenidas exitosamente', result);

        } catch (error) {
            console.error('Error al obtener citas con paginación:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener slots disponibles
    async getAvailableSlots(req, res) {
        try {
            const { doctorId, date } = req.query;
            const duration = parseInt(req.query.duration) || 30;

            if (!doctorId || !date) {
                return apiResponse.badRequest(res, 'Doctor ID y fecha son requeridos');
            }

            const availableSlots = await appointmentService.getAvailableSlots(doctorId, date, duration);

            return apiResponse.success(res, 'Slots disponibles obtenidos exitosamente', availableSlots);

        } catch (error) {
            console.error('Error al obtener slots disponibles:', error);
            
            if (error.message.includes('no encontrado')) {
                return apiResponse.notFound(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Verificar disponibilidad
    async checkAvailability(req, res) {
        try {
            const { doctorId, appointmentDate, appointmentTime } = req.query;
            const duration = parseInt(req.query.duration) || 30;
            const excludeId = req.query.excludeId || null;

            if (!doctorId || !appointmentDate || !appointmentTime) {
                return apiResponse.badRequest(res, 'Doctor ID, fecha y hora son requeridos');
            }

            const isAvailable = await appointmentRepository.checkAvailability(
                doctorId, 
                appointmentDate, 
                appointmentTime, 
                duration, 
                excludeId
            );

            return apiResponse.success(res, 'Disponibilidad verificada', {
                doctorId,
                appointmentDate,
                appointmentTime,
                duration,
                available: isAvailable
            });

        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener estadísticas de citas
    async getAppointmentStats(req, res) {
        try {
            const filters = {
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                doctorId: req.query.doctorId
            };

            const stats = await appointmentService.getEnhancedAppointmentStats(filters);

            return apiResponse.success(res, 'Estadísticas obtenidas exitosamente', { stats });

        } catch (error) {
            console.error('Error al obtener estadísticas de citas:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Procesar recordatorios
    async processReminders(req, res) {
        try {
            const result = await appointmentService.processAppointmentReminders();

            return apiResponse.success(res, 'Recordatorios procesados exitosamente', result);

        } catch (error) {
            console.error('Error al procesar recordatorios:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Marcar como no asistió
    async markAsNoShow(req, res) {
        try {
            const { id } = req.params;

            const appointment = await appointmentRepository.findById(id);
            if (!appointment) {
                return apiResponse.notFound(res, 'Cita no encontrada');
            }

            if (appointment.status !== 'confirmed') {
                return apiResponse.badRequest(res, 'Solo se pueden marcar como no asistida las citas confirmadas');
            }

            const updated = await appointmentRepository.updateAppointment(id, {
                status: 'no_show',
                user_updated: req.user.userId
            });

            if (!updated) {
                return apiResponse.error(res, 'Error al marcar cita como no asistida');
            }

            const updatedAppointment = await appointmentRepository.findById(id);

            return apiResponse.success(res, 'Cita marcada como no asistida', { 
                appointment: updatedAppointment 
            });

        } catch (error) {
            console.error('Error al marcar como no asistió:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Cambiar status de cita
    async changeAppointmentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;

            const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
            if (!status || !validStatuses.includes(status)) {
                return apiResponse.badRequest(res, 'Estado no válido');
            }

            const appointment = await appointmentRepository.findById(id);
            if (!appointment) {
                return apiResponse.notFound(res, 'Cita no encontrada');
            }

            // Validar transiciones de estado permitidas
            const allowedTransitions = {
                'scheduled': ['confirmed', 'cancelled'],
                'confirmed': ['in_progress', 'completed', 'cancelled', 'no_show'],
                'in_progress': ['completed', 'cancelled'],
                'completed': [],
                'cancelled': [],
                'no_show': []
            };

            if (!allowedTransitions[appointment.status].includes(status)) {
                return apiResponse.badRequest(res, 
                    `No se puede cambiar de ${appointment.status} a ${status}`);
            }

            const updateData = {
                status: status,
                user_updated: req.user.userId
            };

            if (notes) {
                updateData.notes = notes;
            }

            const updated = await appointmentRepository.updateAppointment(id, updateData);

            if (!updated) {
                return apiResponse.error(res, 'Error al cambiar estado de la cita');
            }

            const updatedAppointment = await appointmentRepository.findById(id);

            return apiResponse.success(res, 'Estado de cita actualizado exitosamente', { 
                appointment: updatedAppointment 
            });

        } catch (error) {
            console.error('Error al cambiar estado de cita:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Eliminar cita (soft delete)
    async deleteAppointment(req, res) {
        try {
            const { id } = req.params;

            const appointment = await appointmentRepository.findById(id);
            if (!appointment) {
                return apiResponse.notFound(res, 'Cita no encontrada');
            }

            // Solo permitir eliminar citas canceladas o no asistidas
            if (!['cancelled', 'no_show'].includes(appointment.status)) {
                return apiResponse.badRequest(res, 
                    'Solo se pueden eliminar citas canceladas o marcadas como no asistidas');
            }

            const deleted = await appointmentRepository.deleteAppointment(id, req.user.userId);

            if (!deleted) {
                return apiResponse.error(res, 'Error al eliminar cita');
            }

            return apiResponse.success(res, 'Cita eliminada exitosamente');

        } catch (error) {
            console.error('Error al eliminar cita:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Generar reporte de cita
    async generateAppointmentReport(req, res) {
        try {
            const { id } = req.params;

            const report = await appointmentService.generateAppointmentReport(id);

            return apiResponse.success(res, 'Reporte generado exitosamente', { report });

        } catch (error) {
            console.error('Error al generar reporte:', error);
            
            if (error.message.includes('no encontrada')) {
                return apiResponse.notFound(res, error.message);
            }
            
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener citas próximas (dashboard)
    async getUpcomingAppointments(req, res) {
        try {
            const { doctorId, patientId, days = 7 } = req.query;
            
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + parseInt(days));

            const filters = {
                dateFrom: today.toISOString().split('T')[0],
                dateTo: futureDate.toISOString().split('T')[0],
                status: ['scheduled', 'confirmed']
            };

            if (doctorId) filters.doctorId = doctorId;
            if (patientId) filters.patientId = patientId;

            const result = await appointmentRepository.findWithPagination(1, 50, filters);

            // Organizar por fecha
            const appointmentsByDate = {};
            result.appointments.forEach(appointment => {
                const date = appointment.appointmentDate;
                if (!appointmentsByDate[date]) {
                    appointmentsByDate[date] = [];
                }
                appointmentsByDate[date].push(appointment);
            });

            return apiResponse.success(res, 'Citas próximas obtenidas exitosamente', {
                appointmentsByDate,
                total: result.appointments.length,
                period: `${days} días`
            });

        } catch (error) {
            console.error('Error al obtener citas próximas:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener citas del día actual
    async getTodayAppointments(req, res) {
        try {
            const { doctorId } = req.query;
            const today = new Date().toISOString().split('T')[0];

            const filters = {};
            if (doctorId) filters.doctorId = doctorId;

            const appointments = await appointmentRepository.findByDate(today, filters);

            // Agrupar por estado
            const appointmentsByStatus = {
                scheduled: [],
                confirmed: [],
                in_progress: [],
                completed: [],
                cancelled: [],
                no_show: []
            };

            appointments.forEach(appointment => {
                if (appointmentsByStatus[appointment.status]) {
                    appointmentsByStatus[appointment.status].push(appointment);
                }
            });

            return apiResponse.success(res, 'Citas del día obtenidas exitosamente', {
                date: today,
                appointments,
                appointmentsByStatus,
                total: appointments.length,
                summary: {
                    scheduled: appointmentsByStatus.scheduled.length,
                    confirmed: appointmentsByStatus.confirmed.length,
                    in_progress: appointmentsByStatus.in_progress.length,
                    completed: appointmentsByStatus.completed.length,
                    cancelled: appointmentsByStatus.cancelled.length,
                    no_show: appointmentsByStatus.no_show.length
                }
            });

        } catch (error) {
            console.error('Error al obtener citas del día:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }
}

module.exports = new AppointmentController();