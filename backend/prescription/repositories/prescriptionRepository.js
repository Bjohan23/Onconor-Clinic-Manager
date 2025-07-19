const Prescription = require('../models/prescription');

const getAllPrescriptions = async () => {
  return await Prescription().findAll();
};

const getPrescriptionById = async (id) => {
  return await Prescription().findByPk(id);
};

const createPrescription = async (data) => {
  return await Prescription().create(data);
};

const updatePrescription = async (id, data) => {
  const prescription = await Prescription().findByPk(id);
  if (!prescription) return null;
  return await prescription.update(data);
};

const deletePrescription = async (id) => {
  const prescription = await Prescription().findByPk(id);
  if (!prescription) return null;
  await prescription.destroy();
  return true;
};

module.exports = {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
}; 