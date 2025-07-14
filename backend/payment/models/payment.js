const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const definePayment = () => {
    return sequelize.define('payments', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        invoiceId: { type: DataTypes.INTEGER, allowNull: false, field: 'invoice_id' },
        amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
        paymentMethod: { type: DataTypes.STRING, allowNull: false, field: 'payment_method' },
        paymentDate: { type: DataTypes.DATE, allowNull: false, field: 'payment_date' },
        transactionId: { type: DataTypes.STRING, allowNull: true, field: 'transaction_id' },
        status: { type: DataTypes.STRING, allowNull: false }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'payments'
    });
};

const Payment = () => {
    if (!sequelize.models.payments) definePayment();
    return sequelize.models.payments;
};

module.exports = Payment; 