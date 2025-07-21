class TreatmentDto {
  constructor(treatment) {
    this.id = treatment.id;
    this.medicalRecordId = treatment.medicalRecordId;
    this.description = treatment.description;
    this.medications = treatment.medications;
    this.instructions = treatment.instructions;
    this.startDate = treatment.startDate;
    this.endDate = treatment.endDate;

    // Datos del historial médico
    if (treatment.medicalRecord) {
      this.medicalRecord = {
        id: treatment.medicalRecord.id,
        diagnosis: treatment.medicalRecord.diagnosis,
        symptoms: treatment.medicalRecord.symptoms,
        observations: treatment.medicalRecord.observations,
        date: treatment.medicalRecord.date
      };

      // Datos del paciente
      if (treatment.medicalRecord.patient) {
        this.patient = {
          id: treatment.medicalRecord.patient.id,
          firstName: treatment.medicalRecord.patient.firstName || '',
          lastName: treatment.medicalRecord.patient.lastName || '',
          fullName: `${treatment.medicalRecord.patient.firstName || ''} ${treatment.medicalRecord.patient.lastName || ''}`.trim(),
          email: treatment.medicalRecord.patient.user?.email || '',
          phone: treatment.medicalRecord.patient.phone || '',
          dni: treatment.medicalRecord.patient.dni || ''
        };
      }

      // Datos del doctor
      if (treatment.medicalRecord.doctor) {
        this.doctor = {
          id: treatment.medicalRecord.doctor.id,
          firstName: treatment.medicalRecord.doctor.firstName || '',
          lastName: treatment.medicalRecord.doctor.lastName || '',
          fullName: `${treatment.medicalRecord.doctor.firstName || ''} ${treatment.medicalRecord.doctor.lastName || ''}`.trim(),
          email: treatment.medicalRecord.doctor.user?.email || '',
          phone: treatment.medicalRecord.doctor.phone || '',
          specialty: treatment.medicalRecord.doctor.specialty ? {
            id: treatment.medicalRecord.doctor.specialty.id,
            name: treatment.medicalRecord.doctor.specialty.name,
            description: treatment.medicalRecord.doctor.specialty.description
          } : null
        };
      }
    }
  }
}

module.exports = TreatmentDto; 