const PrescriptionRepository = require('../repositories/prescriptionRepository');
const PrescriptionDto = require('../interfaces/prescriptionDto');

const getAllPrescriptions = async () => {
  const prescriptions = await PrescriptionRepository.getAllPrescriptions();
  return prescriptions.map(prescription => new PrescriptionDto(prescription));
};

const getPrescriptionById = async (id) => {
  const prescription = await PrescriptionRepository.getPrescriptionById(id);
  return prescription ? new PrescriptionDto(prescription) : null;
};

const createPrescription = async (data) => {
  const prescription = await PrescriptionRepository.createPrescription(data);
  return new PrescriptionDto(prescription);
};

const updatePrescription = async (id, data) => {
  const prescription = await PrescriptionRepository.updatePrescription(id, data);
  return prescription ? new PrescriptionDto(prescription) : null;
};

const deletePrescription = async (id) => {
  return await PrescriptionRepository.deletePrescription(id);
};

module.exports = {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
}; 