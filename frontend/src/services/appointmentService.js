import { apiClient } from '../infrastructure/api/apiClient';

class AppointmentService {

    // ========== CRUD BÁSICO ==========

    // Crear nueva cita
    async createAppointment(appointmentData) {
        try {
            return await apiClient.post('/appointments', appointmentData);
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    // Obtener cita por ID
    async getAppointmentById(id) {
        try {
            return await apiClient.get(`/appointments/${id}`);
        } catch (error) {
            console.error('Error fetching appointment:', error);
            throw error;
        }
    }

    // Actualizar cita
    async updateAppointment(id, updateData) {
        try {
            return await apiClient.put(`/appointments/${id}`, updateData);
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    }

    // Eliminar cita
    async deleteAppointment(id) {
        try {
            return await apiClient.delete(`/appointments/${id}`);
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }

    // ========== BÚSQUEDA Y LISTADO ==========

    // Obtener citas con filtros y paginación
    async getAppointments(filters = {}, page = 1, limit = 10) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== '')
                )
            });

            return await apiClient.get(`/appointments?${params}`);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
    }

    // Buscar citas
    async searchAppointments(searchTerm, filters = {}, page = 1, limit = 10) {
        try {
            const searchFilters = {
                search: searchTerm,
                ...filters
            };

            return this.getAppointments(searchFilters, page, limit);
        } catch (error) {
            console.error('Error searching appointments:', error);
            throw error;
        }
    }

    // ========== CITAS POR ENTIDAD ==========

    // Obtener citas por paciente
    async getAppointmentsByPatient(patientId, filters = {}) {
        try {
            const params = new URLSearchParams(
                Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== '')
                )
            );

            return await apiClient.get(`/appointments/patient/${patientId}?${params}`);
        } catch (error) {
            console.error('Error fetching patient appointments:', error);
            throw error;
        }
    }

    // Obtener citas por médico
    async getAppointmentsByDoctor(doctorId, filters = {}) {
        try {
            const params = new URLSearchParams(
                Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== '')
                )
            );

            return await apiClient.get(`/appointments/doctor/${doctorId}?${params}`);
        } catch (error) {
            console.error('Error fetching doctor appointments:', error);
            throw error;
        }
    }

    // ========== CITAS POR TIEMPO ==========

    // Obtener citas de hoy
    async getTodaysAppointments() {
        try {
            return await apiClient.get('/appointments/today');
        } catch (error) {
            console.error('Error fetching today appointments:', error);
            throw error;
        }
    }

    // Obtener citas próximas
    async getUpcomingAppointments(days = 7) {
        try {
            return await apiClient.get(`/appointments/upcoming?days=${days}`);
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
            throw error;
        }
    }

    // Obtener citas por rango de fechas
    async getAppointmentsByDateRange(startDate, endDate, filters = {}) {
        try {
            const params = new URLSearchParams({
                startDate,
                endDate,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== '')
                )
            });

            return await apiClient.get(`/appointments/date-range?${params}`);
        } catch (error) {
            console.error('Error fetching appointments by date range:', error);
            throw error;
        }
    }

    // ========== GESTIÓN DE ESTADO ==========

    // Confirmar cita
    async confirmAppointment(id, notes = '') {
        try {
            return await apiClient.patch(`/appointments/${id}/confirm`, { notes });
        } catch (error) {
            console.error('Error confirming appointment:', error);
            throw error;
        }
    }

    // Cancelar cita
    async cancelAppointment(id, reason = '') {
        try {
            return await apiClient.patch(`/appointments/${id}/cancel`, { reason });
        } catch (error) {
            console.error('Error canceling appointment:', error);
            throw error;
        }
    }

    // Completar cita
    async completeAppointment(id, notes = '') {
        try {
            return await apiClient.patch(`/appointments/${id}/complete`, { notes });
        } catch (error) {
            console.error('Error completing appointment:', error);
            throw error;
        }
    }

    // Marcar como no presentado
    async markAsNoShow(id, notes = '') {
        try {
            return await apiClient.patch(`/appointments/${id}/no-show`, { notes });
        } catch (error) {
            console.error('Error marking as no show:', error);
            throw error;
        }
    }

    // ========== DISPONIBILIDAD ==========

    // Verificar disponibilidad
    async checkAvailability(doctorId, date, time) {
        try {
            const params = new URLSearchParams({
                doctorId,
                date,
                time
            });

            return await apiClient.get(`/appointments/check-availability?${params}`);
        } catch (error) {
            console.error('Error checking availability:', error);
            throw error;
        }
    }

    // Obtener slots disponibles
    async getAvailableSlots(doctorId, date) {
        try {
            const params = new URLSearchParams({
                doctorId,
                date
            });

            return await apiClient.get(`/appointments/available-slots?${params}`);
        } catch (error) {
            console.error('Error fetching available slots:', error);
            throw error;
        }
    }

    // ========== ESTADÍSTICAS ==========

    // Obtener estadísticas de citas
    async getAppointmentStats(filters = {}) {
        try {
            const params = new URLSearchParams(
                Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== '')
                )
            );

            const queryString = params.toString();
            const url = queryString ? `/appointments/stats?${queryString}` : '/appointments/stats';
            
            return await apiClient.get(url);
        } catch (error) {
            console.error('Error fetching appointment stats:', error);
            throw error;
        }
    }

    // Obtener estadísticas por médico
    async getDoctorAppointmentStats(doctorId, filters = {}) {
        try {
            const params = new URLSearchParams(
                Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== '')
                )
            );

            return await apiClient.get(`/appointments/stats/doctor/${doctorId}?${params}`);
        } catch (error) {
            console.error('Error fetching doctor appointment stats:', error);
            throw error;
        }
    }

    // ========== NOTIFICACIONES ==========

    // Enviar recordatorio
    async sendReminder(id, type = 'email') {
        try {
            return await apiClient.post(`/appointments/${id}/reminder`, { type });
        } catch (error) {
            console.error('Error sending reminder:', error);
            throw error;
        }
    }

    // ========== REPORTES ==========

    // Generar reporte de citas
    async generateAppointmentReport(filters = {}, format = 'pdf') {
        try {
            const params = new URLSearchParams({
                format,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== '')
                )
            });

            return await apiClient.get(`/appointments/report?${params}`);
        } catch (error) {
            console.error('Error generating appointment report:', error);
            throw error;
        }
    }

    // ========== BULK OPERATIONS ==========

    // Operaciones en lote
    async bulkUpdateAppointments(appointmentIds, updateData) {
        try {
            return await apiClient.patch('/appointments/bulk-update', {
                appointmentIds,
                updateData
            });
        } catch (error) {
            console.error('Error bulk updating appointments:', error);
            throw error;
        }
    }

    // Cancelación en lote
    async bulkCancelAppointments(appointmentIds, reason = '') {
        try {
            return await apiClient.patch('/appointments/bulk-cancel', {
                appointmentIds,
                reason
            });
        } catch (error) {
            console.error('Error bulk canceling appointments:', error);
            throw error;
        }
    }
}

// Exportar instancia del servicio
const appointmentService = new AppointmentService();
export default appointmentService;