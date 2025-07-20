const InvoiceRepository = require('../repositories/invoiceRepository');
const InvoiceDto = require('../interfaces/invoiceDto');

const getAllInvoices = async () => {
  const invoices = await InvoiceRepository.getAllInvoices();
  return invoices.map(invoice => new InvoiceDto(invoice));
};

const getInvoiceById = async (id) => {
  const invoice = await InvoiceRepository.getInvoiceById(id);
  return invoice ? new InvoiceDto(invoice) : null;
};

const createInvoice = async (data) => {
  const invoice = await InvoiceRepository.createInvoice(data);
  return new InvoiceDto(invoice);
};

const updateInvoice = async (id, data) => {
  const invoice = await InvoiceRepository.updateInvoice(id, data);
  return invoice ? new InvoiceDto(invoice) : null;
};

const deleteInvoice = async (id) => {
  return await InvoiceRepository.deleteInvoice(id);
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
}; 