const express = require('express')
const router = express.Router()

const authRoutes = require('../auth/routes/authRoutes')
const userRoutes = require('../configuration/users/routes/userRoutes')

const authMiddleware = require('../shared/middlewares/authMiddleware')


// Rutas públicas (no requieren autenticación)
router.use('/auth', authRoutes)

// Middleware de autenticación para rutas protegidas
router.use(authMiddleware)

// Rutas protegidas (requieren autenticación)

//Dashboard
router.use('/dashboard', require('../dashboard/routes/dashboardRoutes'))

router.use('/users', userRoutes)

module.exports = router
