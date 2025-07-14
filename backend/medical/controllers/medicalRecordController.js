const MedicalRecordService = require('../services/medicalRecordService');

const getAll = async (req, res) => {
  const records = await MedicalRecordService.getAllMedicalRecords();
  res.json(records);
};

const getById = async (req, res) => {
  const record = await MedicalRecordService.getMedicalRecordById(req.params.id);
  if (!record) return res.status(404).json({ message: 'Not found' });
  res.json(record);
};

const create = async (req, res) => {
  const record = await MedicalRecordService.createMedicalRecord(req.body);
  res.status(201).json(record);
};

const update = async (req, res) => {
  const record = await MedicalRecordService.updateMedicalRecord(req.params.id, req.body);
  if (!record) return res.status(404).json({ message: 'Not found' });
  res.json(record);
};

const remove = async (req, res) => {
  const deleted = await MedicalRecordService.deleteMedicalRecord(req.params.id);
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