const MedicalExamService = require('../services/medicalExamService');

const getAll = async (req, res) => {
  const exams = await MedicalExamService.getAllMedicalExams();
  res.json(exams);
};

const getById = async (req, res) => {
  const exam = await MedicalExamService.getMedicalExamById(req.params.id);
  if (!exam) return res.status(404).json({ message: 'Not found' });
  res.json(exam);
};

const create = async (req, res) => {
  const exam = await MedicalExamService.createMedicalExam(req.body);
  res.status(201).json(exam);
};

const update = async (req, res) => {
  const exam = await MedicalExamService.updateMedicalExam(req.params.id, req.body);
  if (!exam) return res.status(404).json({ message: 'Not found' });
  res.json(exam);
};

const remove = async (req, res) => {
  const deleted = await MedicalExamService.deleteMedicalExam(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
}; 