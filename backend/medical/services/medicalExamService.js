const MedicalExamRepository = require('../repositories/medicalExamRepository');
const MedicalExamDto = require('../interfaces/medicalExamDto');

const getAllMedicalExams = async () => {
  const exams = await MedicalExamRepository.getAllMedicalExams();
  return exams.map(exam => new MedicalExamDto(exam));
};

const getMedicalExamById = async (id) => {
  const exam = await MedicalExamRepository.getMedicalExamById(id);
  return exam ? new MedicalExamDto(exam) : null;
};

const createMedicalExam = async (data) => {
  const exam = await MedicalExamRepository.createMedicalExam(data);
  return new MedicalExamDto(exam);
};

const updateMedicalExam = async (id, data) => {
  const exam = await MedicalExamRepository.updateMedicalExam(id, data);
  return exam ? new MedicalExamDto(exam) : null;
};

const deleteMedicalExam = async (id) => {
  return await MedicalExamRepository.deleteMedicalExam(id);
};

module.exports = {
  getAllMedicalExams,
  getMedicalExamById,
  createMedicalExam,
  updateMedicalExam,
  deleteMedicalExam,
}; 