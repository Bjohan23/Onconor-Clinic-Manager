import { apiClient } from '../../infrastructure/api/apiClient';

export const scheduleService = {
    // Obtener horarios por médico
    getSchedulesByDoctor: async (doctorId, filters = {}) => {
        try {
            const params = new URLSearchParams({ doctorId: doctorId.toString() });
            if (filters.dayOfWeek !== undefined) params.append('dayOfWeek', filters.dayOfWeek);
            if (filters.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable);
            if (filters.active !== undefined) params.append('active', filters.active);

            const queryString = params.toString();
            const url = queryString ? `/schedules?${queryString}` : '/schedules';
            
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener horarios por médico:', error);
            throw error;
        }
    },

    // Obtener todos los horarios con filtros
    getAllSchedules: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.doctorId) params.append('doctorId', filters.doctorId);
            if (filters.dayOfWeek !== undefined) params.append('dayOfWeek', filters.dayOfWeek);
            if (filters.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable);
            if (filters.active !== undefined) params.append('active', filters.active);

            const queryString = params.toString();
            const url = queryString ? `/schedules?${queryString}` : '/schedules';
            
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener horarios:', error);
            throw error;
        }
    },

    // Obtener horario por ID
    getScheduleById: async (scheduleId) => {
        try {
            const response = await apiClient.get(`/schedules/${scheduleId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener horario:', error);
            throw error;
        }
    },

    // Crear horario
    createSchedule: async (scheduleData) => {
        try {
            const response = await apiClient.post('/schedules', scheduleData);
            return response.data;
        } catch (error) {
            console.error('Error al crear horario:', error);
            throw error;
        }
    },

    // Crear horarios semanales
    createWeeklySchedule: async (doctorId, weeklyScheduleData) => {
        try {
            const response = await apiClient.post(`/schedules/weekly/${doctorId}`, {
                schedules: weeklyScheduleData
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear horarios semanales:', error);
            throw error;
        }
    },

    // Actualizar horario
    updateSchedule: async (scheduleId, updateData) => {
        try {
            const response = await apiClient.put(`/schedules/${scheduleId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar horario:', error);
            throw error;
        }
    },

    // Eliminar horario
    deleteSchedule: async (scheduleId) => {
        try {
            const response = await apiClient.delete(`/schedules/${scheduleId}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar horario:', error);
            throw error;
        }
    },

    // Cambiar disponibilidad
    toggleAvailability: async (scheduleId, isAvailable) => {
        try {
            const response = await apiClient.patch(`/schedules/${scheduleId}/availability`, {
                isAvailable
            });
            return response.data;
        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
            throw error;
        }
    },

    // Obtener disponibilidad por día
    getAvailabilityByDay: async (doctorId, dayOfWeek) => {
        try {
            const response = await apiClient.get(`/schedules/availability/${doctorId}/${dayOfWeek}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener disponibilidad por día:', error);
            throw error;
        }
    },

    // Obtener horarios por rango de fechas
    getSchedulesByDateRange: async (doctorId, startDate, endDate) => {
        try {
            const params = new URLSearchParams({
                startDate,
                endDate
            });
            
            const response = await apiClient.get(`/schedules/range/${doctorId}?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener horarios por rango de fechas:', error);
            throw error;
        }
    },

    // Validar conflictos de horarios
    validateScheduleConflicts: async (scheduleData) => {
        try {
            const response = await apiClient.post('/schedules/validate', scheduleData);
            return response.data;
        } catch (error) {
            console.error('Error al validar conflictos de horarios:', error);
            throw error;
        }
    },

    // Utilidades para manejo de horarios
    formatTime: (time) => {
        if (!time) return '';
        return time.slice(0, 5); // HH:MM
    },

    getDayName: (dayOfWeek) => {
        const days = [
            'Domingo',
            'Lunes', 
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado'
        ];
        return days[dayOfWeek] || '';
    },

    getDayNameShort: (dayOfWeek) => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return days[dayOfWeek] || '';
    },

    // Crear plantilla de horario semanal vacía
    createEmptyWeeklySchedule: () => {
        return [
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true, breakStart: '12:00', breakEnd: '13:00' }, // Lunes
            { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true, breakStart: '12:00', breakEnd: '13:00' }, // Martes
            { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true, breakStart: '12:00', breakEnd: '13:00' }, // Miércoles
            { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true, breakStart: '12:00', breakEnd: '13:00' }, // Jueves
            { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true, breakStart: '12:00', breakEnd: '13:00' }, // Viernes
            { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: false, breakStart: null, breakEnd: null },     // Sábado
            { dayOfWeek: 0, startTime: '09:00', endTime: '13:00', isAvailable: false, breakStart: null, breakEnd: null }      // Domingo
        ];
    },

    // Validar formato de tiempo
    isValidTimeFormat: (time) => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    },

    // Comparar tiempos
    compareTime: (time1, time2) => {
        const [hours1, minutes1] = time1.split(':').map(Number);
        const [hours2, minutes2] = time2.split(':').map(Number);
        
        const totalMinutes1 = hours1 * 60 + minutes1;
        const totalMinutes2 = hours2 * 60 + minutes2;
        
        return totalMinutes1 - totalMinutes2;
    }
};