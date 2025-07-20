const Patient = require('../../patients/models/patient');
const Doctor = require('../../doctors/models/doctor');
const Appointment = require('../../appointments/models/appointment');
const Schedule = require('../../schedules/models/schedule');
const AppointmentStatus = require('../../appointment-statuses/models/appointmentStatus');

const setupTeam2Associations = () => {
    try {
        // Obtener instancias de los modelos
        const PatientModel = Patient();
        const DoctorModel = Doctor();
        const AppointmentModel = Appointment();
        const ScheduleModel = Schedule();
        const AppointmentStatusModel = AppointmentStatus();

        // Patient -> Appointment (1:N)
        PatientModel.hasMany(AppointmentModel, {
            foreignKey: 'patient_id',
            as: 'appointments',
            onDelete: 'RESTRICT',
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
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        AppointmentModel.belongsTo(DoctorModel, {
            foreignKey: 'doctor_id',
            as: 'doctor',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

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

        // AppointmentStatus -> Appointment (1:N)
        AppointmentStatusModel.hasMany(AppointmentModel, {
            foreignKey: 'appointment_status_id',
            as: 'appointments',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        AppointmentModel.belongsTo(AppointmentStatusModel, {
            foreignKey: 'appointment_status_id',
            as: 'appointmentStatus',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        console.log('✅ Team 2 model associations established successfully');
        
        return {
            Patient: PatientModel,
            Doctor: DoctorModel,
            Appointment: AppointmentModel,
            Schedule: ScheduleModel,
            AppointmentStatus: AppointmentStatusModel
        };

    } catch (error) {
        console.error('❌ Error setting up Team 2 model associations:', error);
        throw error;
    }
};

module.exports = {
    setupTeam2Associations,
    models: {
        Patient,
        Doctor,
        Appointment,
        Schedule,
        AppointmentStatus
    }
};