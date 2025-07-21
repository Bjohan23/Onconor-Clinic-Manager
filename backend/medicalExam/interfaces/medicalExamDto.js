// DTO para MedicalExam con datos relacionados
class MedicalExamDto {
    constructor(exam) {
        this.id = exam.id;
        this.medicalRecordId = exam.medicalRecordId;
        this.examType = exam.examType;
        this.results = exam.results;
        this.filePath = exam.filePath;
        this.examDate = exam.examDate;
        this.notes = exam.notes;
        this.createdAt = exam.created_at || exam.createdAt;
        this.updatedAt = exam.updated_at || exam.updatedAt;

        // Datos del historial médico
        if (exam.medicalRecord) {
            this.medicalRecord = {
                id: exam.medicalRecord.id,
                diagnosis: exam.medicalRecord.diagnosis,
                symptoms: exam.medicalRecord.symptoms,
                observations: exam.medicalRecord.observations,
                date: exam.medicalRecord.date
            };

            // Datos del paciente
            if (exam.medicalRecord.patient) {
                this.patient = {
                    id: exam.medicalRecord.patient.id,
                    firstName: exam.medicalRecord.patient.firstName || '',
                    lastName: exam.medicalRecord.patient.lastName || '',
                    fullName: `${exam.medicalRecord.patient.firstName || ''} ${exam.medicalRecord.patient.lastName || ''}`.trim(),
                    email: exam.medicalRecord.patient.user?.email || '',
                    phone: exam.medicalRecord.patient.phone || '',
                    dni: exam.medicalRecord.patient.dni || ''
                };
            }

            // Datos del doctor
            if (exam.medicalRecord.doctor) {
                this.doctor = {
                    id: exam.medicalRecord.doctor.id,
                    firstName: exam.medicalRecord.doctor.firstName || '',
                    lastName: exam.medicalRecord.doctor.lastName || '',
                    fullName: `${exam.medicalRecord.doctor.firstName || ''} ${exam.medicalRecord.doctor.lastName || ''}`.trim(),
                    email: exam.medicalRecord.doctor.user?.email || '',
                    phone: exam.medicalRecord.doctor.phone || '',
                    specialty: exam.medicalRecord.doctor.specialty ? {
                        id: exam.medicalRecord.doctor.specialty.id,
                        name: exam.medicalRecord.doctor.specialty.name,
                        description: exam.medicalRecord.doctor.specialty.description
                    } : null
                };
            }
        }
    }

    static forCreate(data) {
        return {
            medicalRecordId: data.medicalRecordId,
            examType: data.examType,
            results: data.results,
            filePath: data.filePath,
            examDate: data.examDate,
            notes: data.notes
        };
    }

    static forUpdate(data) {
        const updateData = {};
        if (data.medicalRecordId !== undefined) updateData.medicalRecordId = data.medicalRecordId;
        if (data.examType !== undefined) updateData.examType = data.examType;
        if (data.results !== undefined) updateData.results = data.results;
        if (data.filePath !== undefined) updateData.filePath = data.filePath;
        if (data.examDate !== undefined) updateData.examDate = data.examDate;
        if (data.notes !== undefined) updateData.notes = data.notes;
        return updateData;
    }
}

module.exports = MedicalExamDto; 