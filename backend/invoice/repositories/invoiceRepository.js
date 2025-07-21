const Invoice = require('../models/invoice');
const Patient = require('../../patients/models/patient');
const User = require('../../users/models/user');
const Appointment = require('../../appointments/models/appointment');
const Doctor = require('../../doctors/models/doctor');
const Specialty = require('../../specialties/models/specialty');

class InvoiceRepository {
    async getAllInvoices() {
        return await Invoice().findAll({
            include: [
                {
                    model: Patient(),
                    as: 'patient',
                    attributes: ['id', 'firstName', 'lastName', 'phone', 'dni'],
                    include: [{
                        model: User(),
                        as: 'user',
                        attributes: ['email', 'username']
                    }]
                },
                {
                    model: Appointment(),
                    as: 'appointment',
                    attributes: ['id', 'appointmentDate', 'status', 'reason'],
                    include: [
                        {
                            model: Doctor(),
                            as: 'doctor',
                            attributes: ['id', 'firstName', 'lastName', 'phone'],
                            include: [{
                                model: Specialty(),
                                as: 'specialty',
                                attributes: ['name', 'description']
                            }]
                        }
                    ]
                }
            ]
        });
    }

    async getInvoiceById(id) {
        return await Invoice().findByPk(id, {
            include: [
                {
                    model: Patient(),
                    as: 'patient',
                    attributes: ['id', 'firstName', 'lastName', 'phone', 'dni'],
                    include: [{
                        model: User(),
                        as: 'user',
                        attributes: ['email', 'username']
                    }]
                },
                {
                    model: Appointment(),
                    as: 'appointment',
                    attributes: ['id', 'appointmentDate', 'status', 'reason'],
                    include: [
                        {
                            model: Doctor(),
                            as: 'doctor',
                            attributes: ['id', 'firstName', 'lastName', 'phone'],
                            include: [{
                                model: Specialty(),
                                as: 'specialty',
                                attributes: ['name', 'description']
                            }]
                        }
                    ]
                }
            ]
        });
    }

    async createInvoice(data) {
        return await Invoice().create(data);
    }

    async updateInvoice(id, data) {
        const invoice = await Invoice().findByPk(id);
        if (!invoice) return null;
        await invoice.update(data);
        // Retornar la factura actualizada con todas las asociaciones
        return await this.getInvoiceById(id);
    }

    async deleteInvoice(id) {
        const invoice = await Invoice().findByPk(id);
        if (!invoice) return null;
        await invoice.destroy();
        return true;
    }
}

module.exports = new InvoiceRepository(); 