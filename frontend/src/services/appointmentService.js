const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/v1/api';

class AppointmentService {
    
    // Configurar headers con token
    getHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    // Manejar respuestas de la API
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || `Error ${response.status}`);
        }
        return response.json();
    }

    // ========== CRUD BÁSICO ==========

    // Crear nueva cita
    async createAppointment(appointmentData) {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(appointmentData),
            });

            const result = await this.handleResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    // Obtener cita por ID
    async getAppointmentById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const result = await this.handleResponse(response);
            return result.data.appointment;
        } catch (error) {
            console.error('Error fetching appointment:', error);
            throw error;
        }
    }

    // Actualizar cita
    async updateAppointment(id, updateData) {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(updateData),
            });

            const result = await this.handleResponse(response);
            return result.data.appointment;
        } catch (error) {
            console.error('Error updating appointment:', error);
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

            const response = await fetch(`${API_BASE_URL}/appointments?${params}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const result = await this.handleResponse(response);
            return result.data;
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

            const response = await fetch(`${API_BASE_URL}/appointments/patient/${patientId}?${params}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const result = await this.handleResponse(response);
            return result.data;
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

            const response = await fetch(`${API_BASE_URL}/appointments/doctor/${doctorId}?${params}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const result = await this.handleResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error fetching doctor appointments:', error);
            throw error;
        }
    }

    // ========== CAMBIOS DE ESTADO ==========

    // Confirmar cita
    async confirmAppointment(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}/confirm`, {
                method: 'PATCH',
                headers: this.getHeaders(),
            });

            const result = await this.handleResponse(response);
            return result.data.appointment;
        } catch (error) {
            console.error('Error confirming appointment:', error);
            throw error;
        }
    }

    // Cancelar cita
    async cancelAppointment(id, reason = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ reason }),
            });

            const result = await this.handleResponse(response);
            return result.data.appointment;
        } catch (error) {
            console.error('Error canceling appointment:', error);
            throw error;
        }
    }

    // Completar cita
    async completeAppointment(id, notes = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}/complete`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ notes }),
            });

            const result = await this.handleResponse(response);
            return result.data.appointment;
        } catch (error) {
            console.error('Error completing appointment:', error);
            throw error;
        }
    }

    // Iniciar cita
    async startAppointment(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}/start`, {
                method: 'PATCH',
                headers: this.getHeaders(),
            });

            const result = await this.handleResponse(response);
            return result.data.appointment;
        } catch (error) {
            console.error('Error starting appointment:', error);
            throw error;
        }
    }

    // Marcar como no asistió
    async markAsNoShow(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}/no-show`, {
                method: 'PATCH',
                headers: this.getHeaders(),
            });

            const result = await this.handleResponse(response);
            return result.data.appointment;
        } catch (error) {
            console.error('Error marking as no-show:', error);
            throw error;
        }
    }

    // Reprogramar cita
    async rescheduleAppointment(id, newDate, newTime, reason = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}/reschedule`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    appointmentDate: newDate,
                    appointmentTime: newTime,
                    reason
                }),
            });

            const result = await this.handleResponse(response);
            return result.data.appointment;
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            throw error;
        }
    }

    // ========== CONSULTAS ESPECIALES ==========

    // Verificar disponibilidad
    async checkAvailability(doctorId, date, time, duration = 30) {
        try {
            const params = new URLSearchParams({
                doctorId: doctorId.toString(),
                date,
                time,
                duration: duration.toString()
            });

            const response = await fetch(`${API_BASE_URL}/appointments/check-availability?${params}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const result = await this.handleResponse(response);
            return result.data.availability;
        } catch (error) {
            console.error('Error checking availability:', error);
            throw error;
        }
    }

    // Obtener citas del día
    async getTodaysAppointments(filters = {}) {
        try {
            const params = new URLSearchParams(
                Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== '')
                )
            );

            const response = await fetch(`${API_BASE_URL}/appointments/today?${params}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const result = await this.handleResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error fetching today\'s appointments:', error);
            throw error;
        }
    }

    // Obtener citas próximas
    async getUpcomingAppointments(hours = 24) {
        try {
            const params = new URLSearchParams({
                hours: hours.toString()
            });

            const response = await fetch(`${API_BASE_URL}/appointments/upcoming?${params}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const result = await this.handleResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
            throw error;
        }
    }

    // ========== ESTADÍSTICAS ==========

    // Obtener estadísticas de citas
    async getAppointmentStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/stats`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const result = await this.handleResponse(response);
            return result.data.stats;
        } catch (error) {
            console.error('Error fetching appointment stats:', error);
            throw error;
        }
    }

    // ========== UTILIDADES ==========

    // Formatear fecha para input
    formatDateForInput(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

    // Formatear hora para input
    formatTimeForInput(time) {
        if (!time) return '';
        return time.substring(0, 5); // HH:MM
    }

    // Obtener color del estado
    getStatusColor(status) {
        const colors = {
            'scheduled': '#6B7280',    // Gris
            'confirmed': '#3B82F6',    // Azul
            'in_progress': '#F59E0B',  // Amarillo
            'completed': '#10B981',    // Verde
            'cancelled': '#EF4444',    // Rojo
            'no_show': '#8B5CF6'       // Púrpura
        };
        return colors[status] || '#6B7280';
    }

    // Obtener texto del estado
    getStatusText(status) {
        const texts = {
            'scheduled': 'Programada',
            'confirmed': 'Confirmada',
            'in_progress': 'En Progreso',
            'completed': 'Completada',
            'cancelled': 'Cancelada',
            'no_show': 'No Asistió'
        };
        return texts[status] || status;
    }

    // Obtener color de prioridad
    getPriorityColor(priority) {
        const colors = {
            'low': '#10B981',      // Verde
            'normal': '#6B7280',   // Gris
            'high': '#F59E0B',     // Amarillo
            'urgent': '#EF4444'    // Rojo
        };
        return colors[priority] || '#6B7280';
    }

    // Obtener texto de prioridad
    getPriorityText(priority) {
        const texts = {
            'low': 'Baja',
            'normal': 'Normal',
            'high': 'Alta',
            'urgent': 'Urgente'
        };
        return texts[priority] || priority;
    }

    // Validar datos de cita
    validateAppointmentData(data) {
        const errors = [];

        if (!data.patientId) {
            errors.push('El paciente es obligatorio');
        }

        if (!data.doctorId) {
            errors.push('El médico es obligatorio');
        }

        if (!data.appointmentDate) {
            errors.push('La fecha es obligatoria');
        } else {
            const appointmentDate = new Date(data.appointmentDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (appointmentDate < today) {
                errors.push('La fecha no puede ser en el pasado');
            }
        }

        if (!data.appointmentTime) {
            errors.push('La hora es obligatoria');
        }

        if (!data.reason || data.reason.trim().length < 10) {
            errors.push('El motivo debe tener al menos 10 caracteres');
        }

        return errors;
    }

    // Calcular duración hasta la cita
    calculateTimeUntilAppointment(date, time) {
        const appointmentDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        const diffMs = appointmentDateTime - now;
        
        if (diffMs < 0) {
            return { isPast: true, text: 'Pasada' };
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return { isPast: false, text: `En ${days} día(s)` };
        } else if (hours > 0) {
            return { isPast: false, text: `En ${hours}h ${minutes}m` };
        } else {
            return { isPast: false, text: `En ${minutes} minutos` };
        }
    }
}

export default new AppointmentService();