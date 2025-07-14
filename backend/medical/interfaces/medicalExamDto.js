// DTO para MedicalExam
class MedicalExamDto {
  constructor({ id, medicalRecordId, examType, results, filePath, examDate, notes }) {
    this.id = id;
    this.medicalRecordId = medicalRecordId;
    this.examType = examType;
    this.results = results;
    this.filePath = filePath;
    this.examDate = examDate;
    this.notes = notes;
  }
}

module.exports = MedicalExamDto; 