const invoiceService = require('../services/invoiceService');
const { apiResponse } = require('../../shared/helpers/apiResponseHelper');

class InvoiceController {
    async getAll(req, res) {
        try {
            const invoices = await invoiceService.getAllInvoices();
            return apiResponse.success(res, 'Facturas obtenidas exitosamente', { invoices });
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    async getById(req, res) {
        try {
            const invoice = await invoiceService.getInvoiceById(req.params.id);
            if (!invoice) return apiResponse.notFound(res, 'Factura no encontrada');
            return apiResponse.success(res, 'Factura obtenida exitosamente', { invoice });
        } catch (error) {
            console.error('Error al obtener factura:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    async create(req, res) {
        try {
            const invoice = await invoiceService.createInvoice(req.body);
            return apiResponse.success(res, 'Factura creada exitosamente', { invoice });
        } catch (error) {
            console.error('Error al crear factura:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    async update(req, res) {
        try {
            const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
            if (!invoice) return apiResponse.notFound(res, 'Factura no encontrada');
            return apiResponse.success(res, 'Factura actualizada exitosamente', { invoice });
        } catch (error) {
            console.error('Error al actualizar factura:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    async remove(req, res) {
        try {
            const deleted = await invoiceService.deleteInvoice(req.params.id);
            if (!deleted) return apiResponse.notFound(res, 'Factura no encontrada');
            return apiResponse.success(res, 'Factura eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar factura:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }
}

module.exports = new InvoiceController(); 