const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const definePayment = () => {
    return sequelize.define(
        'payments',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            invoiceId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            amount: {
                type: DataTypes.DECIMAL(10,2),
                allowNull: false,
            },
            paymentMethod: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            paymentDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            transactionId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'payments',
        }
    );
};

const Payment = () => {
    if (!sequelize.models.payments) {
        definePayment();
    }
    return sequelize.models.payments;
};

const associatePayment = () => {
    const Payment = module.exports();
    const Invoice = require('./invoice');
    Payment.belongsTo(Invoice(), { foreignKey: 'invoiceId', as: 'invoice' });
};

module.exports.associatePayment = associatePayment;
module.exports = Payment; 