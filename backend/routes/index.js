const express = require('express')
const router = express.Router()

const authRoutes = require('../auth/routes/authRoutes')
const userRoutes = require('../users/routes/userRoutes')

const authMiddleware = require('../shared/middlewares/authMiddleware')


// Rutas públicas (no requieren autenticación)
router.use('/auth', authRoutes)

// Middleware de autenticación para rutas protegidas
router.use(authMiddleware)

// Rutas protegidas (requieren autenticación)
router.use('/users', userRoutes)
router.use('/medical-records', require('../medical/routes/medicalRecordRoutes'));
router.use('/invoices', require('../medical/routes/invoiceRoutes'));
router.use('/treatments', require('../medical/routes/treatmentRoutes'));
router.use('/prescriptions', require('../medical/routes/prescriptionRoutes'));
router.use('/medical-exams', require('../medical/routes/medicalExamRoutes'));
router.use('/payments', require('../medical/routes/paymentRoutes'));

module.exports = router
