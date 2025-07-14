const PaymentRepository = require('../repositories/paymentRepository');
const PaymentDto = require('../interfaces/paymentDto');

const getAllPayments = async () => {
  const payments = await PaymentRepository.getAllPayments();
  return payments.map(payment => new PaymentDto(payment));
};

const getPaymentById = async (id) => {
  const payment = await PaymentRepository.getPaymentById(id);
  return payment ? new PaymentDto(payment) : null;
};

const createPayment = async (data) => {
  const payment = await PaymentRepository.createPayment(data);
  return new PaymentDto(payment);
};

const updatePayment = async (id, data) => {
  const payment = await PaymentRepository.updatePayment(id, data);
  return payment ? new PaymentDto(payment) : null;
};

const deletePayment = async (id) => {
  return await PaymentRepository.deletePayment(id);
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
}; 