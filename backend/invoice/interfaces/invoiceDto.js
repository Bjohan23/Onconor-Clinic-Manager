// DTO para Invoice
class InvoiceDto {
    constructor(invoice) {
        this.id = invoice.id;
        this.patientId = invoice.patientId;
        this.appointmentId = invoice.appointmentId;
        this.amount = invoice.amount;
        this.tax = invoice.tax;
        this.total = invoice.total;
        this.status = invoice.status;
        this.issueDate = invoice.issueDate;
        this.dueDate = invoice.dueDate;
        this.createdAt = invoice.created_at || invoice.createdAt;
        this.updatedAt = invoice.updated_at || invoice.updatedAt;
    }

    static forCreate(data) {
        return {
            patientId: data.patientId,
            appointmentId: data.appointmentId,
            amount: data.amount,
            tax: data.tax,
            total: data.total,
            status: data.status,
            issueDate: data.issueDate,
            dueDate: data.dueDate
        };
    }

    static forUpdate(data) {
        const updateData = {};
        if (data.patientId !== undefined) updateData.patientId = data.patientId;
        if (data.appointmentId !== undefined) updateData.appointmentId = data.appointmentId;
        if (data.amount !== undefined) updateData.amount = data.amount;
        if (data.tax !== undefined) updateData.tax = data.tax;
        if (data.total !== undefined) updateData.total = data.total;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.issueDate !== undefined) updateData.issueDate = data.issueDate;
        if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
        return updateData;
    }
}

module.exports = InvoiceDto; 