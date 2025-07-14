const MedicalExam = require('../models/medicalExam');

class MedicalExamRepository {
    async getAllMedicalExams() {
        return await MedicalExam().findAll();
    }

    async getMedicalExamById(id) {
        return await MedicalExam().findByPk(id);
    }

    async createMedicalExam(data) {
        return await MedicalExam().create(data);
    }

    async updateMedicalExam(id, data) {
        const exam = await MedicalExam().findByPk(id);
        if (!exam) return null;
        return await exam.update(data);
    }

    async deleteMedicalExam(id) {
        const exam = await MedicalExam().findByPk(id);
        if (!exam) return null;
        await exam.destroy();
        return true;
    }
}

module.exports = new MedicalExamRepository(); 