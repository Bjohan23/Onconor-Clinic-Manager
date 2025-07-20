// Importar todos los modelos
const User = require('../../users/models/user');
const Patient = require('../../patients/models/patient');
const Doctor = require('../../doctors/models/doctor');
const Specialty = require('../../specialties/models/specialty');
const Appointment = require('../../appointments/models/appointment'); // ← NUEVO
const AppointmentStatus = require('../../appointments/models/appointmentStatus'); // ← NUEVO
const Schedule = require('../../appointments/models/schedule'); // ← NUEVO
const MedicalRecord = require('../../medicalRecord/models/medicalRecord'); // ← EQUIPO 3
const Treatment = require('../../treatment/models/treatment'); // ← EQUIPO 3
const Prescription = require('../../prescription/models/prescription'); // ← EQUIPO 3
const MedicalExam = require('../../medicalExam/models/medicalExam'); // ← EQUIPO 3
const Invoice = require('../../invoice/models/invoice'); // ← EQUIPO 3
const Payment = require('../../payment/models/payment'); // ← EQUIPO 3

const setupAssociations = () => {
    try {
        // Obtener instancias de los modelos
        const UserModel = User();
        const PatientModel = Patient();
        const DoctorModel = Doctor();
        const SpecialtyModel = Specialty();
        const AppointmentModel = Appointment(); // ← NUEVO
        const AppointmentStatusModel = AppointmentStatus(); // ← NUEVO
        const ScheduleModel = Schedule(); // ← NUEVO
        const MedicalRecordModel = MedicalRecord(); // ← EQUIPO 3
        const TreatmentModel = Treatment(); // ← EQUIPO 3
        const PrescriptionModel = Prescription(); // ← EQUIPO 3
        const MedicalExamModel = MedicalExam(); // ← EQUIPO 3
        const InvoiceModel = Invoice(); // ← EQUIPO 3
        const PaymentModel = Payment(); // ← EQUIPO 3

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

        // ========== ASOCIACIONES DEL SCHEDULE (EQUIPO 2) ==========

        // Doctor -> Schedule (1:N)
        DoctorModel.hasMany(ScheduleModel, {
            foreignKey: 'doctor_id',
            as: 'schedules',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        ScheduleModel.belongsTo(DoctorModel, {
            foreignKey: 'doctor_id',
            as: 'doctor',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // ========== ASOCIACIONES DEL EQUIPO 3 ==========
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

        // MedicalRecord -> MedicalExam (1:N)
        MedicalRecordModel.hasMany(MedicalExamModel, {
            foreignKey: 'medical_record_id',
            as: 'medicalExams',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        MedicalExamModel.belongsTo(MedicalRecordModel, {
            foreignKey: 'medical_record_id',
            as: 'medicalRecord',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        console.log('✅ Model associations established successfully');
        console.log('📊 All Models with associations:');
        console.log('   🟦 EQUIPO 1: User ↔ Patient, Doctor ↔ Specialty');
        console.log('   🟩 EQUIPO 2: Patient ↔ Appointment ↔ Doctor, Doctor ↔ Schedule');
        console.log('   🟨 EQUIPO 3: MedicalRecord ↔ Treatment ↔ Prescription, Invoice ↔ Payment, MedicalExam');
        
        return {
            User: UserModel,
            Patient: PatientModel,
            Doctor: DoctorModel,
            Specialty: SpecialtyModel,
            Appointment: AppointmentModel,
            AppointmentStatus: AppointmentStatusModel,
            Schedule: ScheduleModel,
            MedicalRecord: MedicalRecordModel,
            Treatment: TreatmentModel,
            Prescription: PrescriptionModel,
            MedicalExam: MedicalExamModel,
            Invoice: InvoiceModel,
            Payment: PaymentModel
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
        Appointment,
        AppointmentStatus,
        Schedule,
        MedicalRecord,
        Treatment,
        Prescription,
        MedicalExam,
        Invoice,
        Payment
    }
};