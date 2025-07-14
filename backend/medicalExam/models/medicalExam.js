const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const defineMedicalExam = () => {
    return sequelize.define('medical_exams', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        medicalRecordId: { type: DataTypes.INTEGER, allowNull: false, field: 'medical_record_id' },
        examType: { type: DataTypes.STRING, allowNull: false, field: 'exam_type' },
        results: { type: DataTypes.TEXT, allowNull: true },
        filePath: { type: DataTypes.STRING, allowNull: true, field: 'file_path' },
        examDate: { type: DataTypes.DATE, allowNull: false, field: 'exam_date' },
        notes: { type: DataTypes.TEXT, allowNull: true }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'medical_exams'
    });
};

const MedicalExam = () => {
    if (!sequelize.models.medical_exams) defineMedicalExam();
    return sequelize.models.medical_exams;
};

module.exports = MedicalExam; 