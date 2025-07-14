# Onconor Clinic Manager

Sistema integral para la gestión de clínicas médicas desarrollado con Node.js, React y MySQL.

## 📋 Descripción del Proyecto

**Onconor Clinic Manager** es una plataforma web diseñada para optimizar la gestión integral de clínicas, enfocándose en la programación de citas, administración de historiales médicos y coordinación entre pacientes y personal de salud.

### Características Principales
- ✅ Gestión de citas médicas
- ✅ Administración de historiales clínicos  
- ✅ Sistema de usuarios con roles (Pacientes, Médicos, Administrativos)
- ✅ Autenticación y autorización con JWT
- ✅ Facturación y reportes
- ✅ Interface responsiva y moderna

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express.js** - Servidor y API REST
- **Sequelize ORM** - Manejo de base de datos
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación y autorización
- **bcrypt** - Encriptación de contraseñas

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Tailwind CSS** - Framework de estilos
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP para comunicación con API

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Jest** - Testing
- **Nodemon** - Desarrollo en tiempo real

## 📁 Estructura del Proyecto

```
Onconor-Clinic-Manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── cors.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Patient.js
│   │   │   ├── Doctor.js
│   │   │   ├── Appointment.js
│   │   │   ├── MedicalRecord.js
│   │   │   ├── Specialty.js
│   │   │   ├── Schedule.js
│   │   │   ├── Treatment.js
│   │   │   ├── Prescription.js
│   │   │   └── Invoice.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── patient.controller.js
│   │   │   ├── doctor.controller.js
│   │   │   ├── appointment.controller.js
│   │   │   ├── medicalRecord.controller.js
│   │   │   └── report.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── email.service.js
│   │   │   ├── encryption.service.js
│   │   │   └── validation.service.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── patient.routes.js
│   │   │   ├── doctor.routes.js
│   │   │   ├── appointment.routes.js
│   │   │   └── report.routes.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── responseHelper.js
│   │   │   └── constants.js
│   │   └── app.js
│   ├── migrations/
│   ├── seeders/
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Loading.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── patients/
│   │   │   │   ├── PatientList.jsx
│   │   │   │   ├── PatientForm.jsx
│   │   │   │   └── PatientDetail.jsx
│   │   │   ├── doctors/
│   │   │   ├── appointments/
│   │   │   ├── medical-records/
│   │   │   └── reports/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Patients.jsx
│   │   │   ├── Doctors.jsx
│   │   │   ├── Appointments.jsx
│   │   │   └── Reports.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   └── useLocalStorage.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   └── patient.service.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   └── App.jsx
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🚀 Guía de Instalación

### Prerrequisitos
- **Node.js** (v16 o superior)
- **MySQL** (v8.0 o superior)
- **npm** o **yarn**
- **Git**

### Configuración de la Base de Datos
1. Instalar MySQL Server
2. Crear una base de datos para el proyecto:
```sql
CREATE DATABASE onconor_clinic_db;
CREATE USER 'onconor_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON onconor_clinic_db.* TO 'onconor_user'@'localhost';
FLUSH PRIVILEGES;
```

### Instalación del Backend
```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
npm run migrate

# Ejecutar seeders (datos de prueba)
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

### Instalación del Frontend
```bash
# Navegar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

## ⚙️ Variables de Entorno

### Backend (.env)
```bash
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=onconor_clinic_db
DB_USER=onconor_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_key

# Servidor
PORT=3001
NODE_ENV=development

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
```

## 📋 Plan de Desarrollo

### Fase 1: Configuración Inicial (Días 1-3)
- [x] Setup del proyecto backend con Node.js y Express
- [x] Configuración de Sequelize y MySQL
- [x] Setup del proyecto frontend con React
- [x] Configuración de Tailwind CSS
- [x] Estructura de carpetas y archivos

### Fase 2: Autenticación y Seguridad (Días 4-7)
- [ ] Sistema de autenticación JWT
- [ ] Modelo de Usuario con roles
- [ ] Middleware de autenticación
- [ ] Encriptación de contraseñas
- [ ] Validación de datos

### Fase 3: Gestión de Usuarios (Días 8-12)
- [ ] Modelos: Patient, Doctor, Admin
- [ ] CRUD operations para usuarios
- [ ] Interface de registro y gestión
- [ ] Sistema de permisos por rol

### Fase 4: Sistema de Citas (Días 13-18)
- [ ] Modelo de Appointment
- [ ] Gestión de horarios médicos
- [ ] Calendario interactivo
- [ ] Sistema de notificaciones

### Fase 5: Historiales Médicos (Días 19-23)
- [ ] Modelo MedicalRecord
- [ ] Seguridad de datos médicos
- [ ] Interface para médicos
- [ ] Auditoría de accesos

### Fase 6: Funcionalidades Complementarias (Días 24-28)
- [ ] Sistema de reportes
- [ ] Facturación e invoices
- [ ] Gestión de especialidades
- [ ] Optimizaciones

### Fase 7: Testing y Despliegue (Días 29-35)
- [ ] Pruebas unitarias
- [ ] Pruebas de integración
- [ ] Configuración de CI/CD
- [ ] Despliegue en servidor

## 🔒 Consideraciones de Seguridad

### Protección de Datos Médicos
- Encriptación AES-256 para datos sensibles
- Control de acceso basado en roles (RBAC)
- Logs de auditoría inmutables
- Cumplimiento con normativas de protección de datos

### Medidas de Seguridad Implementadas
- Validación estricta en frontend y backend
- Sanitización de inputs para prevenir SQL injection
- Rate limiting por IP y usuario
- Tokens JWT con expiración corta
- Refresh tokens seguros
- CORS configurado apropiadamente

## 🧪 Testing

### Backend
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas en modo watch
npm run test:watch
```

### Frontend
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con cobertura
npm run test:coverage
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Pacientes
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Crear paciente
- `GET /api/patients/:id` - Obtener paciente
- `PUT /api/patients/:id` - Actualizar paciente

### Citas
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Cancelar cita

## 🚀 Scripts Disponibles

### Backend
```bash
npm start          # Iniciar servidor de producción
npm run dev        # Iniciar servidor de desarrollo
npm run migrate    # Ejecutar migraciones
npm run seed       # Ejecutar seeders
npm test           # Ejecutar pruebas
npm run lint       # Verificar código con ESLint
```

### Frontend
```bash
npm start          # Iniciar servidor de desarrollo
npm run build      # Construir para producción
npm test           # Ejecutar pruebas
npm run lint       # Verificar código con ESLint
```

## 👥 Equipo de Desarrollo

- **Silva Baldera Jhamir Alexander** - Full Stack Developer
- **Sanchez Sanchez Joselyn** - Frontend Developer
- **Becerra Ventura Johan Jherli** - Backend Developer
- **Atalaya Gil Wagner Boris** - QA/Testing
- **Ramírez García Julio Alessandro** - DevOps
- **José Manuel Diaz Larios** - Database Administrator

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto:
- Email: soporte@onconor.clinic
- Issues: [GitHub Issues](https://github.com/tu-usuario/onconor-clinic-manager/issues)

---

**Onconor Clinic Manager** - Revolucionando la gestión de clínicas médicas 🏥✨
