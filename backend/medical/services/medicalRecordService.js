const MedicalRecordRepository = require('../repositories/medicalRecordRepository');
const MedicalRecordDto = require('../interfaces/medicalRecordDto');

const getAllMedicalRecords = async () => {
  const records = await MedicalRecordRepository.getAllMedicalRecords();
  return records.map(record => new MedicalRecordDto(record));
};

const getMedicalRecordById = async (id) => {
  const record = await MedicalRecordRepository.getMedicalRecordById(id);
  return record ? new MedicalRecordDto(record) : null;
};

const createMedicalRecord = async (data) => {
  const record = await MedicalRecordRepository.createMedicalRecord(data);
  return new MedicalRecordDto(record);
};

const updateMedicalRecord = async (id, data) => {
  const record = await MedicalRecordRepository.updateMedicalRecord(id, data);
  return record ? new MedicalRecordDto(record) : null;
};

const deleteMedicalRecord = async (id) => {
  return await MedicalRecordRepository.deleteMedicalRecord(id);
};

module.exports = {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
}; 