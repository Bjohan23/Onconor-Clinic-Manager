const MedicalExam = require('../models/medicalExam');

const getAllMedicalExams = async () => {
  return await MedicalExam().findAll();
};

const getMedicalExamById = async (id) => {
  return await MedicalExam().findByPk(id);
};

const createMedicalExam = async (data) => {
  return await MedicalExam().create(data);
};

const updateMedicalExam = async (id, data) => {
  const exam = await MedicalExam().findByPk(id);
  if (!exam) return null;
  return await exam.update(data);
};

const deleteMedicalExam = async (id) => {
  const exam = await MedicalExam().findByPk(id);
  if (!exam) return null;
  await exam.destroy();
  return true;
};

module.exports = {
  getAllMedicalExams,
  getMedicalExamById,
  createMedicalExam,
  updateMedicalExam,
  deleteMedicalExam,
}; 