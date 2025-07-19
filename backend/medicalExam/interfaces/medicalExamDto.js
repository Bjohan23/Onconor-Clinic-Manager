// DTO para MedicalExam
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