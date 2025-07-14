const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const definePrescription = () => {
    return sequelize.define(
        'prescriptions',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            treatmentId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            medication: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            dosage: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            frequency: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            duration: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            instructions: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'prescriptions',
        }
    );
};

const Prescription = () => {
    if (!sequelize.models.prescriptions) {
        definePrescription();
    }
    return sequelize.models.prescriptions;
};

const associatePrescription = () => {
    const Prescription = module.exports();
    const Treatment = require('./treatment');
    Prescription.belongsTo(Treatment(), { foreignKey: 'treatmentId', as: 'treatment' });
};

module.exports.associatePrescription = associatePrescription;
module.exports = Prescription; 