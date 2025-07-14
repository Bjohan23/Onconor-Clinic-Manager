const PaymentService = require('../services/paymentService');

const getAll = async (req, res) => {
  const payments = await PaymentService.getAllPayments();
  res.json(payments);
};

const getById = async (req, res) => {
  const payment = await PaymentService.getPaymentById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Not found' });
  res.json(payment);
};

const create = async (req, res) => {
  const payment = await PaymentService.createPayment(req.body);
  res.status(201).json(payment);
};

const update = async (req, res) => {
  const payment = await PaymentService.updatePayment(req.params.id, req.body);
  if (!payment) return res.status(404).json({ message: 'Not found' });
  res.json(payment);
};

const remove = async (req, res) => {
  const deleted = await PaymentService.deletePayment(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
}; 