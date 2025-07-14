const appointmentService = require('../services/appointmentService');
const appointmentRepository = require('../repositories/appointmentRepository');
const { apiResponse } = require('../../shared/helpers/apiResponseHelper');

class AppointmentController {
    
    // Crear nueva cita
    async createAppointment(req, res) {
        try {
            const appointmentData = req.body;

            const appointment = await appointmentService.createAppointmentWithValidation(
                appointmentData, 
                req.user.userId
            );

            return apiResponse.success(res, 'Cita creada exitosamente', { appointment });

        } catch (error) {
            console.error('Error al crear cita:', error);
            return apiResponse.error(res, error.message);
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

    // Actualizar cita
    async updateAppointment(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

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
            return apiResponse.error(res, error.message);
        }
    }

    // Cancelar cita
    async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const cancelledAppointment = await appointmentService.cancelAppointmentWithValidation(
                id, 
                req.user.userId, 
                reason
            );

            return apiResponse.success(res, 'Cita cancelada exitosamente', { 
                appointment: cancelledAppointment 
            });

        } catch (error) {
            console.error('Error al cancelar cita:', error);
            return apiResponse.error(res, error.message);
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
            return apiResponse.error(res, error.message);
        }
    }

    // Completar cita
    async completeAppointment(req, res) {
        try {
            const { id } = req.params;
            const { notes } = req.body;

            const completedAppointment = await appointmentService.completeAppointmentWithValidation(
                id, 
                req.user.userId, 
                notes
            );

            return apiResponse.success(res, 'Cita completada exitosamente', { 
                appointment: completedAppointment 
            });

        } catch (error) {
            console.error('Error al completar cita:', error);
            return apiResponse.error(res, error.message);
        }
    }

    // Listar citas con filtros y paginación
    async getAppointments(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            const filters = {
                status: req.query.status,
                doctorId: req.query.doctorId,
                patientId: req.query.patientId,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                search: req.query.search
            };

            const result = await appointmentService.getAppointmentsWithBusinessLogic(
                filters, 
                { page, limit }
            );

            return apiResponse.success(res, 'Citas obtenidas exitosamente', result);

        } catch (error) {
            console.error('Error al obtener citas:', error);
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

            return apiResponse.success(res, 'Citas del paciente obtenidas exitosamente', { 
                appointments,
                total: appointments.length 
            });

        } catch (error) {
            console.error('Error al obtener citas por paciente:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener citas por médico
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

            return apiResponse.success(res, 'Citas del médico obtenidas exitosamente', { 
                appointments,
                total: appointments.length 
            });

        } catch (error) {
            console.error('Error al obtener citas por médico:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Verificar disponibilidad
    async checkAvailability(req, res) {
        try {
            const { doctorId, date, time, duration } = req.query;

            if (!doctorId || !date || !time) {
                return apiResponse.badRequest(res, 'Doctor, fecha y hora son requeridos');
            }

            const availability = await appointmentService.checkDoctorAvailability(
                doctorId, 
                date, 
                time, 
                parseInt(duration) || 30
            );

            return apiResponse.success(res, 'Disponibilidad verificada', { availability });

        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener citas próximas
    async getUpcomingAppointments(req, res) {
        try {
            const hoursAhead = parseInt(req.query.hours) || 24;

            const appointments = await appointmentService.getUpcomingAppointments(hoursAhead);

            return apiResponse.success(res, 'Citas próximas obtenidas exitosamente', { 
                appointments,
                total: appointments.length 
            });

        } catch (error) {
            console.error('Error al obtener citas próximas:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener estadísticas de citas
    async getAppointmentStats(req, res) {
        try {
            const stats = await appointmentService.getEnhancedAppointmentStats();

            return apiResponse.success(res, 'Estadísticas obtenidas exitosamente', { stats });

        } catch (error) {
            console.error('Error al obtener estadísticas de citas:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Buscar citas
    async searchAppointments(req, res) {
        try {
            const { search, status, doctorId, patientId, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

            const filters = {};
            if (search) filters.search = search;
            if (status) filters.status = status;
            if (doctorId) filters.doctorId = doctorId;
            if (patientId) filters.patientId = patientId;
            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;

            const result = await appointmentService.getAppointmentsWithBusinessLogic(
                filters, 
                { page: parseInt(page), limit: parseInt(limit) }
            );

            return apiResponse.success(res, 'Búsqueda completada exitosamente', result);

        } catch (error) {
            console.error('Error en búsqueda de citas:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Reprogramar cita
    async rescheduleAppointment(req, res) {
        try {
            const { id } = req.params;
            const { appointmentDate, appointmentTime, reason } = req.body;

            if (!appointmentDate || !appointmentTime) {
                return apiResponse.badRequest(res, 'Nueva fecha y hora son requeridas');
            }

            const updateData = {
                appointmentDate,
                appointmentTime,
                notes: reason ? `Reprogramada: ${reason}` : 'Reprogramada'
            };

            const rescheduledAppointment = await appointmentService.updateAppointmentWithValidation(
                id, 
                updateData, 
                req.user.userId
            );

            return apiResponse.success(res, 'Cita reprogramada exitosamente', { 
                appointment: rescheduledAppointment 
            });

        } catch (error) {
            console.error('Error al reprogramar cita:', error);
            return apiResponse.error(res, error.message);
        }
    }

    // Obtener citas del día
    async getTodaysAppointments(req, res) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { doctorId, status } = req.query;

            const filters = {
                dateFrom: today,
                dateTo: today
            };

            if (doctorId) filters.doctorId = doctorId;
            if (status) filters.status = status;

            const result = await appointmentService.getAppointmentsWithBusinessLogic(
                filters, 
                { page: 1, limit: 100 } // Límite alto para obtener todas las citas del día
            );

            return apiResponse.success(res, 'Citas del día obtenidas exitosamente', {
                appointments: result.appointments,
                total: result.appointments.length,
                date: today
            });

        } catch (error) {
            console.error('Error al obtener citas del día:', error);
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
                return apiResponse.badRequest(res, 'Solo se pueden marcar como no asistió las citas confirmadas');
            }

            const updateData = {
                status: 'no_show',
                notes: 'Paciente no asistió a la cita',
                user_updated: req.user.userId
            };

            const updated = await appointmentRepository.updateAppointment(id, updateData);
            if (!updated) {
                return apiResponse.error(res, 'Error al actualizar el estado de la cita');
            }

            const updatedAppointment = await appointmentRepository.findById(id);

            return apiResponse.success(res, 'Cita marcada como no asistió', { 
                appointment: updatedAppointment 
            });

        } catch (error) {
            console.error('Error al marcar como no asistió:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Iniciar cita (cambiar a en progreso)
    async startAppointment(req, res) {
        try {
            const { id } = req.params;

            const appointment = await appointmentRepository.findById(id);
            if (!appointment) {
                return apiResponse.notFound(res, 'Cita no encontrada');
            }

            if (!['scheduled', 'confirmed'].includes(appointment.status)) {
                return apiResponse.badRequest(res, 'Solo se pueden iniciar citas programadas o confirmadas');
            }

            const updateData = {
                status: 'in_progress',
                user_updated: req.user.userId
            };

            const updated = await appointmentRepository.updateAppointment(id, updateData);
            if (!updated) {
                return apiResponse.error(res, 'Error al iniciar la cita');
            }

            const updatedAppointment = await appointmentRepository.findById(id);

            return apiResponse.success(res, 'Cita iniciada exitosamente', { 
                appointment: updatedAppointment 
            });

        } catch (error) {
            console.error('Error al iniciar cita:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }
}

module.exports = new AppointmentController();