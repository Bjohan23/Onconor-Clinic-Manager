// DTO para Invoice con datos relacionados
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

        // Datos del paciente
        if (invoice.patient) {
            this.patient = {
                id: invoice.patient.id,
                firstName: invoice.patient.firstName || '',
                lastName: invoice.patient.lastName || '',
                fullName: `${invoice.patient.firstName || ''} ${invoice.patient.lastName || ''}`.trim(),
                email: invoice.patient.user?.email || '',
                phone: invoice.patient.phone || '',
                dni: invoice.patient.dni || ''
            };
        }

        // Datos de la cita
        if (invoice.appointment) {
            this.appointment = {
                id: invoice.appointment.id,
                appointmentDate: invoice.appointment.appointmentDate,
                status: invoice.appointment.status,
                reason: invoice.appointment.reason,
                doctor: invoice.appointment.doctor ? {
                    id: invoice.appointment.doctor.id,
                    firstName: invoice.appointment.doctor.firstName || '',
                    lastName: invoice.appointment.doctor.lastName || '',
                    fullName: `${invoice.appointment.doctor.firstName || ''} ${invoice.appointment.doctor.lastName || ''}`.trim(),
                    phone: invoice.appointment.doctor.phone || '',
                    specialty: invoice.appointment.doctor.specialty ? {
                        id: invoice.appointment.doctor.specialty.id,
                        name: invoice.appointment.doctor.specialty.name,
                        description: invoice.appointment.doctor.specialty.description
                    } : null
                } : null
            };
        }
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