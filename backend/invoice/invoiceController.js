const InvoiceService = require('../services/invoiceService');

const getAll = async (req, res) => {
  const invoices = await InvoiceService.getAllInvoices();
  res.json(invoices);
};

const getById = async (req, res) => {
  const invoice = await InvoiceService.getInvoiceById(req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Not found' });
  res.json(invoice);
};

const create = async (req, res) => {
  const invoice = await InvoiceService.createInvoice(req.body);
  res.status(201).json(invoice);
};

const update = async (req, res) => {
  const invoice = await InvoiceService.updateInvoice(req.params.id, req.body);
  if (!invoice) return res.status(404).json({ message: 'Not found' });
  res.json(invoice);
};

const remove = async (req, res) => {
  const deleted = await InvoiceService.deleteInvoice(req.params.id);
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