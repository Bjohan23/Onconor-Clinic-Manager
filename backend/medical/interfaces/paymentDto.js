// DTO para Payment
class PaymentDto {
  constructor({ id, invoiceId, amount, paymentMethod, paymentDate, transactionId, status }) {
    this.id = id;
    this.invoiceId = invoiceId;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    this.paymentDate = paymentDate;
    this.transactionId = transactionId;
    this.status = status;
  }
}

module.exports = PaymentDto; 