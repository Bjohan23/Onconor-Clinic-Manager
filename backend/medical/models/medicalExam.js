const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const defineMedicalExam = () => {
    return sequelize.define(
        'medical_exams',
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
            examType: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            results: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            filePath: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            examDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'medical_exams',
        }
    );
};

const MedicalExam = () => {
    if (!sequelize.models.medical_exams) {
        defineMedicalExam();
    }
    return sequelize.models.medical_exams;
};

const associateMedicalExam = () => {
    const MedicalExam = module.exports();
    const MedicalRecord = require('./medicalRecord');
    MedicalExam.belongsTo(MedicalRecord(), { foreignKey: 'medicalRecordId', as: 'medicalRecord' });
};

module.exports.associateMedicalExam = associateMedicalExam;
module.exports = MedicalExam; 