const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../../shared/middlewares/authMiddleware');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de reportes
router.get('/dashboard-stats', reportController.getDashboardStats);
router.get('/appointments', reportController.getAppointmentsReport);
router.get('/revenue', reportController.getRevenueReport);
router.get('/doctors', reportController.getDoctorsReport);
router.get('/patients', reportController.getPatientsReport);
router.get('/specialties', reportController.getSpecialtiesReport);

// Rutas de exportación
router.post('/export/pdf', reportController.exportToPDF);
router.post('/export/excel', reportController.exportToExcel);

module.exports = router;