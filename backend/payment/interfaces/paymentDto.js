// DTO para Payment con datos relacionados
class PaymentDto {
  constructor(payment) {
    this.id = payment.id;
    this.invoiceId = payment.invoiceId;
    this.amount = payment.amount;
    this.paymentMethod = payment.paymentMethod;
    this.paymentDate = payment.paymentDate;
    this.transactionId = payment.transactionId;
    this.status = payment.status;
    this.createdAt = payment.created_at || payment.createdAt;
    this.updatedAt = payment.updated_at || payment.updatedAt;

    // Datos de la factura
    if (payment.invoice) {
      this.invoice = {
        id: payment.invoice.id,
        amount: payment.invoice.amount,
        tax: payment.invoice.tax,
        total: payment.invoice.total,
        status: payment.invoice.status,
        issueDate: payment.invoice.issueDate,
        dueDate: payment.invoice.dueDate,
        
        // Datos del paciente desde la factura
        patient: payment.invoice.patient ? {
          id: payment.invoice.patient.id,
          firstName: payment.invoice.patient.firstName || '',
          lastName: payment.invoice.patient.lastName || '',
          fullName: `${payment.invoice.patient.firstName || ''} ${payment.invoice.patient.lastName || ''}`.trim(),
          email: payment.invoice.patient.user?.email || '',
          phone: payment.invoice.patient.phone || '',
          dni: payment.invoice.patient.dni || ''
        } : null,
        
        // Datos de la cita desde la factura
        appointment: payment.invoice.appointment ? {
          id: payment.invoice.appointment.id,
          appointmentDate: payment.invoice.appointment.appointmentDate,
          status: payment.invoice.appointment.status,
          reason: payment.invoice.appointment.reason,
          doctor: payment.invoice.appointment.doctor ? {
            id: payment.invoice.appointment.doctor.id,
            firstName: payment.invoice.appointment.doctor.firstName || '',
            lastName: payment.invoice.appointment.doctor.lastName || '',
            fullName: `${payment.invoice.appointment.doctor.firstName || ''} ${payment.invoice.appointment.doctor.lastName || ''}`.trim(),
            phone: payment.invoice.appointment.doctor.phone || '',
            specialty: payment.invoice.appointment.doctor.specialty ? {
              id: payment.invoice.appointment.doctor.specialty.id,
              name: payment.invoice.appointment.doctor.specialty.name,
              description: payment.invoice.appointment.doctor.specialty.description
            } : null
          } : null
        } : null
      };
    }
  }

  static forCreate(data) {
    return {
      invoiceId: data.invoiceId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate,
      transactionId: data.transactionId,
      status: data.status
    };
  }

  static forUpdate(data) {
    const updateData = {};
    if (data.invoiceId !== undefined) updateData.invoiceId = data.invoiceId;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.paymentDate !== undefined) updateData.paymentDate = data.paymentDate;
    if (data.transactionId !== undefined) updateData.transactionId = data.transactionId;
    if (data.status !== undefined) updateData.status = data.status;
    return updateData;
  }
}

module.exports = PaymentDto; 