import { apiClient } from '../../infrastructure/api/apiClient';

export const reportService = {
    // Estadísticas del dashboard
    getDashboardStats: async () => {
        try {
            const response = await apiClient.get('/reports/dashboard-stats');
            return response.data;
        } catch (error) {
            console.error('Error al obtener estadísticas del dashboard:', error);
            throw error;
        }
    },

    // Reporte de citas
    getAppointmentsReport: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.doctorId) params.append('doctorId', filters.doctorId);
            if (filters.specialtyId) params.append('specialtyId', filters.specialtyId);

            const queryString = params.toString();
            const url = queryString ? `/reports/appointments?${queryString}` : '/reports/appointments';
            
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reporte de citas:', error);
            throw error;
        }
    },

    // Reporte de ingresos
    getRevenueReport: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.groupBy) params.append('groupBy', filters.groupBy);

            const queryString = params.toString();
            const url = queryString ? `/reports/revenue?${queryString}` : '/reports/revenue';
            
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reporte de ingresos:', error);
            throw error;
        }
    },

    // Reporte de médicos
    getDoctorsReport: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const queryString = params.toString();
            const url = queryString ? `/reports/doctors?${queryString}` : '/reports/doctors';
            
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reporte de médicos:', error);
            throw error;
        }
    },

    // Reporte de pacientes
    getPatientsReport: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const queryString = params.toString();
            const url = queryString ? `/reports/patients?${queryString}` : '/reports/patients';
            
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reporte de pacientes:', error);
            throw error;
        }
    },

    // Reporte de especialidades
    getSpecialtiesReport: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const queryString = params.toString();
            const url = queryString ? `/reports/specialties?${queryString}` : '/reports/specialties';
            
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reporte de especialidades:', error);
            throw error;
        }
    },

    // Exportar a PDF
    exportToPDF: async (reportType, filters = {}) => {
        try {
            const response = await apiClient.post('/reports/export/pdf', {
                reportType,
                filters
            }, {
                responseType: 'blob'
            });

            // Crear URL para descarga
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            // Crear enlace temporal para descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpiar URL
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error al exportar a PDF:', error);
            throw error;
        }
    },

    // Exportar a Excel
    exportToExcel: async (reportType, filters = {}) => {
        try {
            const response = await apiClient.post('/reports/export/excel', {
                reportType,
                filters
            }, {
                responseType: 'blob'
            });

            // Crear URL para descarga
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = window.URL.createObjectURL(blob);
            
            // Crear enlace temporal para descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpiar URL
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            throw error;
        }
    }
};