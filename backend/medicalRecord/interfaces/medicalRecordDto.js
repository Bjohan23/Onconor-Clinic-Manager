// DTO para MedicalRecord con datos relacionados
class MedicalRecordDto {
  constructor(record) {
    this.id = record.id;
    this.patientId = record.patientId;
    this.doctorId = record.doctorId;
    this.appointmentId = record.appointmentId;
    this.diagnosis = record.diagnosis;
    this.symptoms = record.symptoms;
    this.observations = record.observations;
    this.date = record.date;

    // Datos del paciente (los nombres están en la tabla patients)
    if (record.patient) {
      this.patient = {
        id: record.patient.id,
        firstName: record.patient.firstName || '',
        lastName: record.patient.lastName || '',
        fullName: `${record.patient.firstName || ''} ${record.patient.lastName || ''}`.trim(),
        email: record.patient.user?.email || '',
        phone: record.patient.phone || '',
        dni: record.patient.dni || ''
      };
    }

    // Datos del doctor (los nombres están en la tabla doctors)
    if (record.doctor) {
      this.doctor = {
        id: record.doctor.id,
        firstName: record.doctor.firstName || '',
        lastName: record.doctor.lastName || '',
        fullName: `${record.doctor.firstName || ''} ${record.doctor.lastName || ''}`.trim(),
        email: record.doctor.user?.email || '',
        phone: record.doctor.phone || '',
        specialty: record.doctor.specialty ? {
          id: record.doctor.specialty.id,
          name: record.doctor.specialty.name,
          description: record.doctor.specialty.description
        } : null
      };
    }
  }
}

module.exports = MedicalRecordDto; 