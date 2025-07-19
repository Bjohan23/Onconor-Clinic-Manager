const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const definePrescription = () => {
    return sequelize.define('prescriptions', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        treatmentId: { type: DataTypes.INTEGER, allowNull: false, field: 'treatment_id' },
        medication: { type: DataTypes.STRING, allowNull: false },
        dosage: { type: DataTypes.STRING, allowNull: false },
        frequency: { type: DataTypes.STRING, allowNull: false },
        duration: { type: DataTypes.STRING, allowNull: false },
        instructions: { type: DataTypes.TEXT, allowNull: true }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'prescriptions'
    });
};

const Prescription = () => {
    if (!sequelize.models.prescriptions) definePrescription();
    return sequelize.models.prescriptions;
};

module.exports = Prescription; 