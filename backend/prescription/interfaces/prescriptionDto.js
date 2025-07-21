// DTO para Prescription con datos relacionados
class PrescriptionDto {
  constructor(prescription) {
    this.id = prescription.id;
    this.treatmentId = prescription.treatmentId;
    this.medication = prescription.medication;
    this.dosage = prescription.dosage;
    this.frequency = prescription.frequency;
    this.duration = prescription.duration;
    this.instructions = prescription.instructions;

    // Datos del tratamiento
    if (prescription.treatment) {
      this.treatment = {
        id: prescription.treatment.id,
        description: prescription.treatment.description,
        medications: prescription.treatment.medications,
        startDate: prescription.treatment.startDate,
        endDate: prescription.treatment.endDate
      };

      // Datos del historial médico
      if (prescription.treatment.medicalRecord) {
        this.medicalRecord = {
          id: prescription.treatment.medicalRecord.id,
          diagnosis: prescription.treatment.medicalRecord.diagnosis,
          symptoms: prescription.treatment.medicalRecord.symptoms,
          observations: prescription.treatment.medicalRecord.observations,
          date: prescription.treatment.medicalRecord.date
        };

        // Datos del paciente
        if (prescription.treatment.medicalRecord.patient) {
          this.patient = {
            id: prescription.treatment.medicalRecord.patient.id,
            firstName: prescription.treatment.medicalRecord.patient.firstName || '',
            lastName: prescription.treatment.medicalRecord.patient.lastName || '',
            fullName: `${prescription.treatment.medicalRecord.patient.firstName || ''} ${prescription.treatment.medicalRecord.patient.lastName || ''}`.trim(),
            email: prescription.treatment.medicalRecord.patient.user?.email || '',
            phone: prescription.treatment.medicalRecord.patient.phone || '',
            dni: prescription.treatment.medicalRecord.patient.dni || ''
          };
        }

        // Datos del doctor
        if (prescription.treatment.medicalRecord.doctor) {
          this.doctor = {
            id: prescription.treatment.medicalRecord.doctor.id,
            firstName: prescription.treatment.medicalRecord.doctor.firstName || '',
            lastName: prescription.treatment.medicalRecord.doctor.lastName || '',
            fullName: `${prescription.treatment.medicalRecord.doctor.firstName || ''} ${prescription.treatment.medicalRecord.doctor.lastName || ''}`.trim(),
            email: prescription.treatment.medicalRecord.doctor.user?.email || '',
            phone: prescription.treatment.medicalRecord.doctor.phone || '',
            specialty: prescription.treatment.medicalRecord.doctor.specialty ? {
              id: prescription.treatment.medicalRecord.doctor.specialty.id,
              name: prescription.treatment.medicalRecord.doctor.specialty.name,
              description: prescription.treatment.medicalRecord.doctor.specialty.description
            } : null
          };
        }
      }
    }
  }
}

module.exports = PrescriptionDto; 