const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

// Determinar el entorno y cargar el archivo .env apropiado
const env = process.env.NODE_ENV || 'development'; 
let envPath;
if (env === 'production') {
    envPath = path.resolve(__dirname, '.env.production');
} else if (env === 'qas') {
    envPath = path.resolve(__dirname, '.env.development');
} else if (env === 'development') {
    envPath = path.resolve(__dirname, '.env.development');
} else {
    envPath = path.resolve(__dirname, '.env');
}

// Cargar las variables de entorno
console.log(`Loading environment file: ${envPath}`);
dotenv.config({ path: envPath });

// Crear la instancia de Express
const app = express();



// Configuración de CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));
app.get('/', (req, res) => {
    res.send('🚀 API está activa y funcionando correctamente! ✅');
});

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));


// Rutas principales
const routes = require('./routes');
app.use('/v1/api', routes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// Log para mostrar entorno y variables clave
console.log('Environment:', env);
console.log('Server URL:', process.env.SERVER_URL);

// Puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Environment: ${env}`);
});

module.exports = app;
