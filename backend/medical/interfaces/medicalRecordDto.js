// DTO para MedicalRecord
class MedicalRecordDto {
  constructor({ id, patientId, doctorId, appointmentId, diagnosis, symptoms, observations, date }) {
    this.id = id;
    this.patientId = patientId;
    this.doctorId = doctorId;
    this.appointmentId = appointmentId;
    this.diagnosis = diagnosis;
    this.symptoms = symptoms;
    this.observations = observations;
    this.date = date;
  }
}

module.exports = MedicalRecordDto; 