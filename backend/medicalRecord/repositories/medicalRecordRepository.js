const MedicalRecord = require('../models/medicalRecord');

const getAllMedicalRecords = async () => {
  return await MedicalRecord().findAll();
};

const getMedicalRecordById = async (id) => {
  return await MedicalRecord().findByPk(id);
};

const createMedicalRecord = async (data) => {
  return await MedicalRecord().create(data);
};

const updateMedicalRecord = async (id, data) => {
  const record = await MedicalRecord().findByPk(id);
  if (!record) return null;
  return await record.update(data);
};

const deleteMedicalRecord = async (id) => {
  const record = await MedicalRecord().findByPk(id);
  if (!record) return null;
  await record.destroy();
  return true;
};

module.exports = {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
}; 