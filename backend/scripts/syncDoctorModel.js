const { sequelize } = require('../config/database');
const models = require('../shared/models');

async function syncDoctorModel() {
    try {
        console.log('🔄 Iniciando sincronización del modelo Doctor...');

        // Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida.');

        // Obtener instancias de modelos
        const { User: UserModel, Doctor: DoctorModel, Specialty: SpecialtyModel } = models;

        // Sincronizar modelos en orden de dependencias
        console.log('🔄 Sincronizando modelo User...');
        await UserModel.sync({ alter: true });
        
        console.log('🔄 Sincronizando modelo Specialty...');
        await SpecialtyModel.sync({ alter: true });
        
        console.log('🔄 Sincronizando modelo Doctor...');
        await DoctorModel.sync({ alter: true });

        // Crear especialidades básicas si no existen
        const specialtyCount = await SpecialtyModel.count();
        if (specialtyCount === 0) {
            console.log('🔄 Creando especialidades básicas...');
            await SpecialtyModel.bulkCreate([
                { name: 'Cardiología', description: 'Especialidad médica que se ocupa del corazón y sistema circulatorio', isActive: true },
                { name: 'Neurología', description: 'Especialidad médica que se ocupa del sistema nervioso', isActive: true },
                { name: 'Pediatría', description: 'Especialidad médica que se ocupa de la salud de niños y adolescentes', isActive: true },
                { name: 'Ginecología', description: 'Especialidad médica que se ocupa de la salud femenina', isActive: true },
                { name: 'Traumatología', description: 'Especialidad médica que se ocupa de lesiones del aparato locomotor', isActive: true },
                { name: 'Medicina General', description: 'Especialidad médica de atención primaria', isActive: true },
                { name: 'Dermatología', description: 'Especialidad médica que se ocupa de la piel', isActive: true },
                { name: 'Oftalmología', description: 'Especialidad médica que se ocupa de los ojos', isActive: true }
            ]);
            console.log('✅ Especialidades básicas creadas.');
        }

        console.log('✅ Sincronización del modelo Doctor completada exitosamente.');
        console.log('📊 Estructura de la tabla doctors actualizada con todos los campos necesarios.');
        
        // Mostrar estructura de la tabla
        const tableDescription = await sequelize.getQueryInterface().describeTable('doctors');
        console.log('📋 Campos en la tabla doctors:');
        Object.keys(tableDescription).forEach(field => {
            console.log(`   - ${field}: ${tableDescription[field].type}`);
        });

    } catch (error) {
        console.error('❌ Error durante la sincronización:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    syncDoctorModel()
        .then(() => {
            console.log('🎉 Proceso de sincronización completado.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en el proceso de sincronización:', error);
            process.exit(1);
        });
}

module.exports = syncDoctorModel;