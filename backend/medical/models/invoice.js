const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Payment = require('./payment');

const defineInvoice = () => {
    return sequelize.define(
        'invoices',
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
            appointmentId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            amount: {
                type: DataTypes.DECIMAL(10,2),
                allowNull: false,
            },
            tax: {
                type: DataTypes.DECIMAL(10,2),
                allowNull: true,
            },
            total: {
                type: DataTypes.DECIMAL(10,2),
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            issueDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            dueDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'invoices',
        }
    );
};

const Invoice = () => {
    if (!sequelize.models.invoices) {
        defineInvoice();
    }
    return sequelize.models.invoices;
};

const associateInvoice = () => {
    const Invoice = module.exports();
    // Relación: Invoice hasMany Payment
    Invoice.hasMany(Payment(), { foreignKey: 'invoiceId', as: 'payments' });
    // Relación: belongsTo Patient, Appointment (deben existir esos modelos en el sistema)
    // Ejemplo:
    // const Patient = require('../../users/models/patient');
    // Invoice.belongsTo(Patient(), { foreignKey: 'patientId', as: 'patient' });
};

module.exports.associateInvoice = associateInvoice;
module.exports = Invoice; 