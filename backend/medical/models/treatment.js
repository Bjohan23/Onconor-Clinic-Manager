const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Prescription = require('./prescription');

const defineTreatment = () => {
    return sequelize.define(
        'treatments',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            medicalRecordId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            medications: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            instructions: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'treatments',
        }
    );
};

const Treatment = () => {
    if (!sequelize.models.treatments) {
        defineTreatment();
    }
    return sequelize.models.treatments;
};

const associateTreatment = () => {
    const Treatment = module.exports();
    // Relación: Treatment hasMany Prescription
    Treatment.hasMany(Prescription(), { foreignKey: 'treatmentId', as: 'prescriptions' });
    // Relación: belongsTo MedicalRecord
    const MedicalRecord = require('./medicalRecord');
    Treatment.belongsTo(MedicalRecord(), { foreignKey: 'medicalRecordId', as: 'medicalRecord' });
};

module.exports.associateTreatment = associateTreatment;
module.exports = Treatment; 