// DTO para Prescription
class PrescriptionDto {
  constructor({ id, treatmentId, medication, dosage, frequency, duration, instructions }) {
    this.id = id;
    this.treatmentId = treatmentId;
    this.medication = medication;
    this.dosage = dosage;
    this.frequency = frequency;
    this.duration = duration;
    this.instructions = instructions;
  }
}

module.exports = PrescriptionDto; 