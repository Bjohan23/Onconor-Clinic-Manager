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
const appointmentRoutes = require('../appointments/routes/appointmentRoutes')
const scheduleRoutes = require('../appointments/routes/scheduleRoutes')
const availabilityRoutes = require('../appointments/routes/availabilityRoutes')
const reportRoutes = require('../reports/routes/reportRoutes')

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
router.use('/appointments', appointmentRoutes)
router.use('/schedules', scheduleRoutes)
router.use('/availability', availabilityRoutes)

// REPORTES Y ESTADÍSTICAS
router.use('/reports', reportRoutes)

// EQUIPO 3: Historiales y Facturación - YA INCLUIDOS ARRIBA
// Rutas ya agregadas:
// - /medical-records (línea 41)
// - /treatments (línea 36) 
// - /invoices (línea 35)
// - /payments (línea 40)
// - /prescriptions (línea 37)
// - /medical-exams (línea 39)

module.exports = router