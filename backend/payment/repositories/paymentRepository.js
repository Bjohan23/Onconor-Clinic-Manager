const Payment = require('../models/payment');

const getAllPayments = async () => {
  return await Payment().findAll();
};

const getPaymentById = async (id) => {
  return await Payment().findByPk(id);
};

const createPayment = async (data) => {
  return await Payment().create(data);
};

const updatePayment = async (id, data) => {
  const payment = await Payment().findByPk(id);
  if (!payment) return null;
  return await payment.update(data);
};

const deletePayment = async (id) => {
  const payment = await Payment().findByPk(id);
  if (!payment) return null;
  await payment.destroy();
  return true;
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
}; 