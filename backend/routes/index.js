const express = require('express')
const router = express.Router()

// Importar todas las rutas
const authRoutes = require('../auth/routes/authRoutes')
const userRoutes = require('../users/routes/userRoutes')
const patientRoutes = require('../patients/routes/patientRoutes')
const doctorRoutes = require('../doctors/routes/doctorRoutes')
const specialtyRoutes = require('../specialties/routes/specialtyRoutes')

const invoiceRoutes = require('../invoice/routes/invoiceRoutes')
const treatmentRoutes = require('../treatment/routes/treatmentRoutes')
const prescriptionRoutes = require('../prescription/routes/prescriptionRoutes')
const medicalExamRoutes = require('../medicalexam/routes/medicalExamRoutes')
const paymentRoutes = require('../payment/routes/paymentRoutes')
const medicalRecordRoutes = require('../medicalrecord/routes/medicalRecordRoutes')
=======
const appointmentRoutes = require('../appointments/routes/appointmentRoutes') // ← NUEVO

// Middleware de autenticación
const authMiddleware = require('../shared/middlewares/authMiddleware')

// Rutas públicas (no requieren autenticación)
router.use('/auth', authRoutes)

// Middleware de autenticación para rutas protegidas
router.use(authMiddleware)

// Rutas protegidas (requieren autenticación)
// EQUIPO 1: Usuarios y Autenticación
router.use('/users', userRoutes)
router.use('/patients', patientRoutes)
router.use('/doctors', doctorRoutes)
router.use('/specialties', specialtyRoutes)
router.use('/invoices', invoiceRoutes)
router.use('/treatments', treatmentRoutes)
router.use('/prescriptions', prescriptionRoutes)
router.use('/medical-exams', medicalExamRoutes)
router.use('/payments', paymentRoutes)
router.use('/medical-records', medicalRecordRoutes)

// EQUIPO 2: Citas y Horarios
router.use('/appointments', appointmentRoutes) // ← NUEVO

// EQUIPO 3: Historiales y Facturación (pendientes)
// router.use('/medical-records', medicalRecordRoutes)
// router.use('/treatments', treatmentRoutes)
// router.use('/invoices', invoiceRoutes)
// router.use('/payments', paymentRoutes)
// router.use('/reports', reportRoutes)

module.exports = router