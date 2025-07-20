const Invoice = require('../models/invoice');

const getAllInvoices = async () => {
  return await Invoice().findAll();
};

const getInvoiceById = async (id) => {
  return await Invoice().findByPk(id);
};

const createInvoice = async (data) => {
  return await Invoice().create(data);
};

const updateInvoice = async (id, data) => {
  const invoice = await Invoice().findByPk(id);
  if (!invoice) return null;
  return await invoice.update(data);
};

const deleteInvoice = async (id) => {
  const invoice = await Invoice().findByPk(id);
  if (!invoice) return null;
  await invoice.destroy();
  return true;
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
}; 