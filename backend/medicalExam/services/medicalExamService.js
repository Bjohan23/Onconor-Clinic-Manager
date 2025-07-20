const medicalExamRepository = require('../repositories/medicalExamRepository');
const MedicalExamDto = require('../interfaces/medicalExamDto');

class MedicalExamService {
    async getAllMedicalExams() {
        const exams = await medicalExamRepository.getAllMedicalExams();
        return exams.map(exam => new MedicalExamDto(exam));
    }

    async getMedicalExamById(id) {
        const exam = await medicalExamRepository.getMedicalExamById(id);
        return exam ? new MedicalExamDto(exam) : null;
    }

    async createMedicalExam(data) {
        const exam = await medicalExamRepository.createMedicalExam(data);
        return new MedicalExamDto(exam);
    }

    async updateMedicalExam(id, data) {
        const exam = await medicalExamRepository.updateMedicalExam(id, data);
        return exam ? new MedicalExamDto(exam) : null;
    }

    async deleteMedicalExam(id) {
        return await medicalExamRepository.deleteMedicalExam(id);
    }
}

module.exports = new MedicalExamService(); 