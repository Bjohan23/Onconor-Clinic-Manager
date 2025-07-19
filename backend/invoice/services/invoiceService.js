const invoiceRepository = require('../repositories/invoiceRepository');
const InvoiceDto = require('../interfaces/invoiceDto');

class InvoiceService {
    async getAllInvoices() {
        const invoices = await invoiceRepository.getAllInvoices();
        return invoices.map(invoice => new InvoiceDto(invoice));
    }

    async getInvoiceById(id) {
        const invoice = await invoiceRepository.getInvoiceById(id);
        return invoice ? new InvoiceDto(invoice) : null;
    }

    async createInvoice(data) {
        const invoice = await invoiceRepository.createInvoice(data);
        return new InvoiceDto(invoice);
    }

    async updateInvoice(id, data) {
        const invoice = await invoiceRepository.updateInvoice(id, data);
        return invoice ? new InvoiceDto(invoice) : null;
    }

    async deleteInvoice(id) {
        return await invoiceRepository.deleteInvoice(id);
    }
}

module.exports = new InvoiceService(); 