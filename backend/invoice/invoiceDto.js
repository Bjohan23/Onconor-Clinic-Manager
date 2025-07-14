// DTO para Invoice
class InvoiceDto {
  constructor({ id, patientId, appointmentId, amount, tax, total, status, issueDate, dueDate }) {
    this.id = id;
    this.patientId = patientId;
    this.appointmentId = appointmentId;
    this.amount = amount;
    this.tax = tax;
    this.total = total;
    this.status = status;
    this.issueDate = issueDate;
    this.dueDate = dueDate;
  }
}

module.exports = InvoiceDto; 