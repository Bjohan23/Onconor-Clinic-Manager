const express = require('express')
const router = express.Router()

// ========== IMPORTAR RUTAS ==========

// Equipo 1: Usuarios y Autenticación
const authRoutes = require('../auth/routes/authRoutes')
const userRoutes = require('../users/routes/userRoutes')
const patientRoutes = require('../patients/routes/patientRoutes')
const doctorRoutes = require('../doctors/routes/doctorRoutes')
const specialtyRoutes = require('../specialties/routes/specialtyRoutes')

// Equipo 2: Citas y Horarios  
const appointmentRoutes = require('../appointments/routes/appointmentRoutes')
const scheduleRoutes = require('../schedules/routes/scheduleRoutes')
const appointmentStatusRoutes = require('../appointment-statuses/routes/appointmentStatusRoutes')

// Middleware de autenticación
const authMiddleware = require('../shared/middlewares/authMiddleware')

// ========== RUTAS PÚBLICAS ==========
// (No requieren autenticación)
router.use('/auth', authRoutes)

// ========== MIDDLEWARE DE AUTENTICACIÓN ==========
// Todas las rutas siguientes requieren autenticación
router.use(authMiddleware)

// ========== RUTAS PROTEGIDAS EQUIPO 1 ==========
// Gestión de Usuarios y Autenticación
router.use('/users', userRoutes)
router.use('/patients', patientRoutes)
router.use('/doctors', doctorRoutes)
router.use('/specialties', specialtyRoutes)

// ========== RUTAS PROTEGIDAS EQUIPO 2 ==========
// Gestión de Citas y Horarios
router.use('/appointments', appointmentRoutes)
router.use('/schedules', scheduleRoutes)
router.use('/appointment-statuses', appointmentStatusRoutes)

// ========== RUTAS PREPARADAS PARA EQUIPO 3 ==========
// Gestión de Historiales Médicos y Facturación
// (Se activarán cuando el Equipo 3 implemente sus rutas)
// router.use('/medical-records', medicalRecordRoutes)
// router.use('/treatments', treatmentRoutes)
// router.use('/prescriptions', prescriptionRoutes)
// router.use('/medical-exams', medicalExamRoutes)
// router.use('/invoices', invoiceRoutes)
// router.use('/payments', paymentRoutes)
// router.use('/reports', reportRoutes)

// ========== RUTA DE SALUD DEL SISTEMA ==========
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Onconor Clinic Manager API is running',
        timestamp: new Date().toISOString(),
        modules: {
            team1: {
                name: 'Usuarios y Autenticación',
                status: 'active',
                endpoints: ['/auth', '/users', '/patients', '/doctors', '/specialties']
            },
            team2: {
                name: 'Citas y Horarios',
                status: 'active',
                endpoints: ['/appointments', '/schedules', '/appointment-statuses']
            },
            team3: {
                name: 'Historiales y Facturación',
                status: 'pending',
                endpoints: ['pending implementation']
            }
        }
    });
});

// ========== RUTA DE INFORMACIÓN DE ENDPOINTS ==========
router.get('/endpoints', (req, res) => {
    res.json({
        success: true,
        message: 'Endpoints disponibles en Onconor Clinic Manager API',
        baseUrl: '/api',
        authentication: 'JWT Bearer Token required (except /auth routes)',
        endpoints: {
            // Equipo 1
            authentication: {
                base: '/auth',
                endpoints: [
                    'POST /login - Iniciar sesión',
                    'POST /register - Registrar usuario',
                    'POST /logout - Cerrar sesión',
                    'POST /refresh-token - Renovar token'
                ]
            },
            users: {
                base: '/users',
                endpoints: [
                    'GET /:id - Obtener usuario por ID',
                    'PUT /:id - Actualizar usuario',
                    'GET /search - Buscar usuarios',
                    'GET /establishment/:establishmentId - Usuarios por establecimiento',
                    'DELETE /:id - Desactivar usuario',
                    'PATCH /:id/activate - Activar usuario'
                ]
            },
            patients: {
                base: '/patients',
                endpoints: [
                    'POST / - Crear paciente',
                    'GET /active - Listar pacientes activos',
                    'GET /paginated - Pacientes con paginación',
                    'GET /search - Buscar pacientes',
                    'GET /stats - Estadísticas de pacientes',
                    'GET /:id - Obtener paciente por ID',
                    'PUT /:id - Actualizar paciente',
                    'DELETE /:id - Desactivar paciente',
                    'PATCH /:id/activate - Activar paciente',
                    'GET /dni/:dni - Buscar por DNI',
                    'GET /check-dni/:dni - Verificar disponibilidad de DNI'
                ]
            },
            doctors: {
                base: '/doctors',
                endpoints: [
                    'POST / - Crear médico',
                    'GET /active - Listar médicos activos',
                    'GET /paginated - Médicos con paginación',
                    'GET /search - Buscar médicos',
                    'GET /specialty/:specialtyId - Médicos por especialidad',
                    'GET /stats - Estadísticas de médicos',
                    'GET /:id - Obtener médico por ID',
                    'PUT /:id - Actualizar médico',
                    'DELETE /:id - Desactivar médico',
                    'PATCH /:id/activate - Activar médico',
                    'PATCH /:id/specialty - Cambiar especialidad',
                    'GET /license/:license - Buscar por licencia',
                    'GET /check-license/:license - Verificar disponibilidad de licencia'
                ]
            },
            specialties: {
                base: '/specialties',
                endpoints: [
                    'POST / - Crear especialidad',
                    'GET /active - Listar especialidades activas',
                    'GET /all - Todas las especialidades',
                    'GET /paginated - Especialidades con paginación',
                    'GET /search - Buscar especialidades',
                    'GET /stats - Estadísticas de especialidades',
                    'GET /:id - Obtener especialidad por ID',
                    'GET /:id/doctors - Especialidad con médicos',
                    'PUT /:id - Actualizar especialidad',
                    'DELETE /:id - Desactivar especialidad',
                    'PATCH /:id/activate - Activar especialidad',
                    'GET /check-name/:name - Verificar disponibilidad de nombre'
                ]
            },
            // Equipo 2
            appointments: {
                base: '/appointments',
                endpoints: [
                    'POST / - Crear cita',
                    'GET /search - Buscar citas',
                    'GET /paginated - Citas con paginación',
                    'GET /upcoming - Citas próximas',
                    'GET /today - Citas del día',
                    'GET /available-slots - Obtener slots disponibles',
                    'GET /check-availability - Verificar disponibilidad',
                    'GET /stats - Estadísticas de citas',
                    'POST /process-reminders - Procesar recordatorios',
                    'GET /:id - Obtener cita por ID',
                    'PUT /:id - Actualizar cita',
                    'DELETE /:id - Eliminar cita',
                    'PATCH /:id/cancel - Cancelar cita',
                    'PATCH /:id/confirm - Confirmar cita',
                    'PATCH /:id/complete - Completar cita',
                    'PATCH /:id/reschedule - Reprogramar cita',
                    'PATCH /:id/no-show - Marcar como no asistió',
                    'PATCH /:id/status - Cambiar estado',
                    'GET /:id/report - Generar reporte',
                    'GET /patient/:patientId - Citas por paciente',
                    'GET /doctor/:doctorId - Citas por doctor',
                    'GET /date/:date - Citas por fecha'
                ]
            },
            schedules: {
                base: '/schedules',
                endpoints: [
                    'POST / - Crear horario',
                    'POST /weekly - Crear horario semanal',
                    'GET /search - Buscar horarios',
                    'GET /available-doctors - Médicos disponibles',
                    'GET /check-conflict - Verificar conflictos',
                    'GET /stats - Estadísticas de horarios',
                    'GET /:id - Obtener horario por ID',
                    'PUT /:id - Actualizar horario',
                    'DELETE /:id - Eliminar horario',
                    'PATCH /:id/toggle-availability - Cambiar disponibilidad',
                    'POST /:id/clone - Clonar horario',
                    'GET /:id/report - Generar reporte',
                    'GET /doctor/:doctorId - Horarios por doctor',
                    'GET /doctor/:doctorId/active - Horarios activos del doctor',
                    'GET /doctor/:doctorId/weekly - Resumen semanal',
                    'GET /day/:dayOfWeek - Horarios por día de semana'
                ]
            },
            appointmentStatuses: {
                base: '/appointment-statuses',
                endpoints: [
                    'POST / - Crear estado de cita',
                    'GET /search - Buscar estados',
                    'GET /active - Estados activos',
                    'GET /all - Todos los estados',
                    'GET /paginated - Estados con paginación',
                    'GET /category/:category - Estados por categoría',
                    'GET /stats - Estadísticas de estados',
                    'GET /check-name/:name - Verificar disponibilidad de nombre',
                    'GET /:id - Obtener estado por ID',
                    'PUT /:id - Actualizar estado',
                    'DELETE /:id - Desactivar estado',
                    'PATCH /:id/activate - Activar estado',
                    'PATCH /:id/set-default - Establecer como defecto'
                ]
            }
        },
        notes: [
            'Todos los endpoints (excepto /auth) requieren autenticación JWT',
            'Los endpoints de Team 3 (historiales y facturación) están pendientes de implementación',
            'Consultar documentación individual de cada endpoint para parámetros específicos',
            'Códigos de respuesta estándar: 200 (éxito), 400 (error cliente), 401 (no autorizado), 404 (no encontrado), 500 (error servidor)'
        ]
    });
});

module.exports = router