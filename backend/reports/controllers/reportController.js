const { createSuccessResponse, createErrorResponse } = require('../../shared/helpers/apiResponseHelper');
const reportService = require('../services/reportService');

const reportController = {
    // Estadísticas generales del dashboard
    async getDashboardStats(req, res) {
        try {
            const stats = await reportService.getDashboardStats();
            res.json(createSuccessResponse(stats, 'Estadísticas del dashboard obtenidas exitosamente'));
        } catch (error) {
            console.error('Error al obtener estadísticas del dashboard:', error);
            res.status(500).json(createErrorResponse('Error interno del servidor', error.message));
        }
    },

    // Reporte de citas por período
    async getAppointmentsReport(req, res) {
        try {
            const { startDate, endDate, doctorId, specialtyId } = req.query;
            const report = await reportService.getAppointmentsReport({
                startDate,
                endDate,
                doctorId,
                specialtyId
            });
            res.json(createSuccessResponse(report, 'Reporte de citas obtenido exitosamente'));
        } catch (error) {
            console.error('Error al obtener reporte de citas:', error);
            res.status(500).json(createErrorResponse('Error interno del servidor', error.message));
        }
    },

    // Reporte de ingresos por período
    async getRevenueReport(req, res) {
        try {
            const { startDate, endDate, groupBy } = req.query;
            const report = await reportService.getRevenueReport({
                startDate,
                endDate,
                groupBy: groupBy || 'month'
            });
            res.json(createSuccessResponse(report, 'Reporte de ingresos obtenido exitosamente'));
        } catch (error) {
            console.error('Error al obtener reporte de ingresos:', error);
            res.status(500).json(createErrorResponse('Error interno del servidor', error.message));
        }
    },

    // Reporte de médicos por productividad
    async getDoctorsReport(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const report = await reportService.getDoctorsReport({
                startDate,
                endDate
            });
            res.json(createSuccessResponse(report, 'Reporte de médicos obtenido exitosamente'));
        } catch (error) {
            console.error('Error al obtener reporte de médicos:', error);
            res.status(500).json(createErrorResponse('Error interno del servidor', error.message));
        }
    },

    // Reporte de pacientes por período
    async getPatientsReport(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const report = await reportService.getPatientsReport({
                startDate,
                endDate
            });
            res.json(createSuccessResponse(report, 'Reporte de pacientes obtenido exitosamente'));
        } catch (error) {
            console.error('Error al obtener reporte de pacientes:', error);
            res.status(500).json(createErrorResponse('Error interno del servidor', error.message));
        }
    },

    // Reporte de especialidades más solicitadas
    async getSpecialtiesReport(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const report = await reportService.getSpecialtiesReport({
                startDate,
                endDate
            });
            res.json(createSuccessResponse(report, 'Reporte de especialidades obtenido exitosamente'));
        } catch (error) {
            console.error('Error al obtener reporte de especialidades:', error);
            res.status(500).json(createErrorResponse('Error interno del servidor', error.message));
        }
    },

    // Exportar reporte a PDF
    async exportToPDF(req, res) {
        try {
            const { reportType, filters } = req.body;
            const pdfBuffer = await reportService.exportToPDF(reportType, filters);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error al exportar a PDF:', error);
            res.status(500).json(createErrorResponse('Error al exportar a PDF', error.message));
        }
    },

    // Exportar reporte a Excel
    async exportToExcel(req, res) {
        try {
            const { reportType, filters } = req.body;
            const excelBuffer = await reportService.exportToExcel(reportType, filters);
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
            res.send(excelBuffer);
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            res.status(500).json(createErrorResponse('Error al exportar a Excel', error.message));
        }
    }
};

module.exports = reportController;