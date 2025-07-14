const Invoice = require('../models/invoice');

class InvoiceRepository {
    async getAllInvoices() {
        return await Invoice().findAll();
    }

    async getInvoiceById(id) {
        return await Invoice().findByPk(id);
    }

    async createInvoice(data) {
        return await Invoice().create(data);
    }

    async updateInvoice(id, data) {
        const invoice = await Invoice().findByPk(id);
        if (!invoice) return null;
        return await invoice.update(data);
    }

    async deleteInvoice(id) {
        const invoice = await Invoice().findByPk(id);
        if (!invoice) return null;
        await invoice.destroy();
        return true;
    }
}

module.exports = new InvoiceRepository(); 