const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const defineInvoice = () => {
    return sequelize.define('invoices', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        patientId: { type: DataTypes.INTEGER, allowNull: false, field: 'patient_id' },
        appointmentId: { type: DataTypes.INTEGER, allowNull: false, field: 'appointment_id' },
        amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
        tax: { type: DataTypes.DECIMAL(10,2), allowNull: true },
        total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false },
        issueDate: { type: DataTypes.DATE, allowNull: false, field: 'issue_date' },
        dueDate: { type: DataTypes.DATE, allowNull: true, field: 'due_date' }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'invoices'
    });
};

const Invoice = () => {
    if (!sequelize.models.invoices) defineInvoice();
    return sequelize.models.invoices;
};

module.exports = Invoice; 