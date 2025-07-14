const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const defineMedicalRecord = () => {
    return sequelize.define('medical_records', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        patientId: { type: DataTypes.INTEGER, allowNull: false, field: 'patient_id' },
        doctorId: { type: DataTypes.INTEGER, allowNull: false, field: 'doctor_id' },
        appointmentId: { type: DataTypes.INTEGER, allowNull: false, field: 'appointment_id' },
        diagnosis: { type: DataTypes.STRING, allowNull: false },
        symptoms: { type: DataTypes.TEXT, allowNull: true },
        observations: { type: DataTypes.TEXT, allowNull: true },
        date: { type: DataTypes.DATE, allowNull: false }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'medical_records'
    });
};

const MedicalRecord = () => {
    if (!sequelize.models.medical_records) defineMedicalRecord();
    return sequelize.models.medical_records;
};

module.exports = MedicalRecord; 