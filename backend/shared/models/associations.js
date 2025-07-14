// Importar todos los modelos
const User = require('../../users/models/user');
const Patient = require('../../patients/models/patient');
const Doctor = require('../../doctors/models/doctor');
const Specialty = require('../../specialties/models/specialty');
const Appointment = require('../../appointments/models/appointment'); // ← NUEVO
const AppointmentStatus = require('../../appointments/models/appointmentStatus'); // ← NUEVO

const setupAssociations = () => {
    try {
        // Obtener instancias de los modelos
        const UserModel = User();
        const PatientModel = Patient();
        const DoctorModel = Doctor();
        const SpecialtyModel = Specialty();
        const AppointmentModel = Appointment(); // ← NUEVO
        const AppointmentStatusModel = AppointmentStatus(); // ← NUEVO

        // ========== ASOCIACIONES EXISTENTES (EQUIPO 1) ==========

        // User -> Patient (1:1)
        UserModel.hasOne(PatientModel, {
            foreignKey: 'user_id',
            as: 'patient',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        PatientModel.belongsTo(UserModel, {
            foreignKey: 'user_id',
            as: 'user',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // User -> Doctor (1:1)
        UserModel.hasOne(DoctorModel, {
            foreignKey: 'user_id',
            as: 'doctor',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        DoctorModel.belongsTo(UserModel, {
            foreignKey: 'user_id',
            as: 'user',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // Specialty -> Doctor (1:N)
        SpecialtyModel.hasMany(DoctorModel, {
            foreignKey: 'specialty_id',
            as: 'doctors',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        DoctorModel.belongsTo(SpecialtyModel, {
            foreignKey: 'specialty_id',
            as: 'specialty',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        // ========== NUEVAS ASOCIACIONES (EQUIPO 2 - APPOINTMENTS) ==========

        // Patient -> Appointment (1:N)
        PatientModel.hasMany(AppointmentModel, {
            foreignKey: 'patient_id',
            as: 'appointments',
            onDelete: 'RESTRICT', // No permitir eliminar paciente si tiene citas
            onUpdate: 'CASCADE'
        });

        AppointmentModel.belongsTo(PatientModel, {
            foreignKey: 'patient_id',
            as: 'patient',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        // Doctor -> Appointment (1:N)
        DoctorModel.hasMany(AppointmentModel, {
            foreignKey: 'doctor_id',
            as: 'appointments',
            onDelete: 'RESTRICT', // No permitir eliminar médico si tiene citas
            onUpdate: 'CASCADE'
        });

        AppointmentModel.belongsTo(DoctorModel, {
            foreignKey: 'doctor_id',
            as: 'doctor',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        // AppointmentStatus -> Appointment (1:N) - OPCIONAL si usas tabla de estados
        // Por ahora el status está como ENUM en el modelo Appointment
        // Pero si quieres usar tabla separada, descomenta esto:
        /*
        AppointmentStatusModel.hasMany(AppointmentModel, {
            foreignKey: 'status_id',
            as: 'appointments',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        AppointmentModel.belongsTo(AppointmentStatusModel, {
            foreignKey: 'status_id',
            as: 'appointmentStatus',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
        */

        // ========== ASOCIACIONES FUTURAS (EQUIPO 3) ==========
        // Estas se agregarán cuando el Equipo 3 complete sus modelos

        /*
        // Appointment -> MedicalRecord (1:1)
        AppointmentModel.hasOne(MedicalRecordModel, {
            foreignKey: 'appointment_id',
            as: 'medicalRecord',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        MedicalRecordModel.belongsTo(AppointmentModel, {
            foreignKey: 'appointment_id',
            as: 'appointment',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // Patient -> MedicalRecord (1:N)
        PatientModel.hasMany(MedicalRecordModel, {
            foreignKey: 'patient_id',
            as: 'medicalRecords',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        MedicalRecordModel.belongsTo(PatientModel, {
            foreignKey: 'patient_id',
            as: 'patient',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        // Doctor -> MedicalRecord (1:N)
        DoctorModel.hasMany(MedicalRecordModel, {
            foreignKey: 'doctor_id',
            as: 'medicalRecords',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        MedicalRecordModel.belongsTo(DoctorModel, {
            foreignKey: 'doctor_id',
            as: 'doctor',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        // MedicalRecord -> Treatment (1:N)
        MedicalRecordModel.hasMany(TreatmentModel, {
            foreignKey: 'medical_record_id',
            as: 'treatments',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        TreatmentModel.belongsTo(MedicalRecordModel, {
            foreignKey: 'medical_record_id',
            as: 'medicalRecord',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // Treatment -> Prescription (1:N)
        TreatmentModel.hasMany(PrescriptionModel, {
            foreignKey: 'treatment_id',
            as: 'prescriptions',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        PrescriptionModel.belongsTo(TreatmentModel, {
            foreignKey: 'treatment_id',
            as: 'treatment',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // Patient -> Invoice (1:N)
        PatientModel.hasMany(InvoiceModel, {
            foreignKey: 'patient_id',
            as: 'invoices',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        InvoiceModel.belongsTo(PatientModel, {
            foreignKey: 'patient_id',
            as: 'patient',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        // Appointment -> Invoice (1:1)
        AppointmentModel.hasOne(InvoiceModel, {
            foreignKey: 'appointment_id',
            as: 'invoice',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        InvoiceModel.belongsTo(AppointmentModel, {
            foreignKey: 'appointment_id',
            as: 'appointment',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        // Invoice -> Payment (1:N)
        InvoiceModel.hasMany(PaymentModel, {
            foreignKey: 'invoice_id',
            as: 'payments',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        PaymentModel.belongsTo(InvoiceModel, {
            foreignKey: 'invoice_id',
            as: 'invoice',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
        */

        console.log('✅ Model associations established successfully');
        console.log('📊 Models with associations:');
        console.log('   - User ↔ Patient, Doctor');
        console.log('   - Specialty ↔ Doctor');
        console.log('   - Patient ↔ Appointment');
        console.log('   - Doctor ↔ Appointment');
        console.log('   - Future: MedicalRecord, Treatment, Invoice, Payment');
        
        return {
            User: UserModel,
            Patient: PatientModel,
            Doctor: DoctorModel,
            Specialty: SpecialtyModel,
            Appointment: AppointmentModel, // ← NUEVO
            AppointmentStatus: AppointmentStatusModel // ← NUEVO
        };

    } catch (error) {
        console.error('❌ Error setting up model associations:', error);
        throw error;
    }
};

module.exports = {
    setupAssociations,
    models: {
        User,
        Patient,
        Doctor,
        Specialty,
        Appointment, // ← NUEVO
        AppointmentStatus // ← NUEVO
    }
};