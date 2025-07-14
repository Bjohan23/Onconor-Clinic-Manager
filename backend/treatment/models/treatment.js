const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const defineTreatment = () => {
    return sequelize.define('treatments', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        medicalRecordId: { type: DataTypes.INTEGER, allowNull: false, field: 'medical_record_id' },
        description: { type: DataTypes.STRING, allowNull: false },
        medications: { type: DataTypes.TEXT, allowNull: true },
        instructions: { type: DataTypes.TEXT, allowNull: true },
        startDate: { type: DataTypes.DATE, allowNull: false, field: 'start_date' },
        endDate: { type: DataTypes.DATE, allowNull: true, field: 'end_date' }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'treatments'
    });
};

const Treatment = () => {
    if (!sequelize.models.treatments) defineTreatment();
    return sequelize.models.treatments;
};

module.exports = Treatment; 