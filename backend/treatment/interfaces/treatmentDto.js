class TreatmentDto {
  constructor({ id, medicalRecordId, description, medications, instructions, startDate, endDate }) {
    this.id = id;
    this.medicalRecordId = medicalRecordId;
    this.description = description;
    this.medications = medications;
    this.instructions = instructions;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

module.exports = TreatmentDto; 