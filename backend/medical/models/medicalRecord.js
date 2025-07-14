const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const defineMedicalRecord = () => {
    return sequelize.define(
        'medical_records',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            patientId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            doctorId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            appointmentId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            diagnosis: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            symptoms: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            observations: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'medical_records',
        }
    );
};

const MedicalRecord = () => {
    if (!sequelize.models.medical_records) {
        defineMedicalRecord();
    }
    return sequelize.models.medical_records;
};

// Asociaciones entre modelos médicos
const Treatment = require('./treatment');
const MedicalExam = require('./medicalExam');

const associateMedicalRecord = () => {
    const MedicalRecord = module.exports();
    // Relación: MedicalRecord hasMany Treatment
    MedicalRecord.hasMany(Treatment(), { foreignKey: 'medicalRecordId', as: 'treatments' });
    // Relación: MedicalRecord hasMany MedicalExam
    MedicalRecord.hasMany(MedicalExam(), { foreignKey: 'medicalRecordId', as: 'medicalExams' });
    // Relación: belongsTo Patient, Doctor, Appointment (deben existir esos modelos en el sistema)
    // Ejemplo:
    // const Patient = require('../../users/models/patient');
    // MedicalRecord.belongsTo(Patient(), { foreignKey: 'patientId', as: 'patient' });
};

module.exports.associateMedicalRecord = associateMedicalRecord;
module.exports = MedicalRecord; 