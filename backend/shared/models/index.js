const { setupAssociations } = require('./associations');

// Configurar asociaciones al importar
const models = setupAssociations();

// Exportar todos los modelos configurados
module.exports = {
    // Modelos existentes (Equipo 1)
    User: models.User,
    Patient: models.Patient,
    Doctor: models.Doctor,
    Specialty: models.Specialty,
    
    // Nuevos modelos (Equipo 2)
    Appointment: models.Appointment,
    AppointmentStatus: models.AppointmentStatus,
    
    // Futuros modelos (Equipo 3) - se agregarán después
    // MedicalRecord: models.MedicalRecord,
    // Treatment: models.Treatment,
    // Prescription: models.Prescription,
    // MedicalExam: models.MedicalExam,
    // Invoice: models.Invoice,
    // Payment: models.Payment,
    
    // Función de configuración
    setupAssociations
};