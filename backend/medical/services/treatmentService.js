const TreatmentRepository = require('../repositories/treatmentRepository');
const TreatmentDto = require('../interfaces/treatmentDto');

const getAllTreatments = async () => {
  const treatments = await TreatmentRepository.getAllTreatments();
  return treatments.map(treatment => new TreatmentDto(treatment));
};

const getTreatmentById = async (id) => {
  const treatment = await TreatmentRepository.getTreatmentById(id);
  return treatment ? new TreatmentDto(treatment) : null;
};

const createTreatment = async (data) => {
  const treatment = await TreatmentRepository.createTreatment(data);
  return new TreatmentDto(treatment);
};

const updateTreatment = async (id, data) => {
  const treatment = await TreatmentRepository.updateTreatment(id, data);
  return treatment ? new TreatmentDto(treatment) : null;
};

const deleteTreatment = async (id) => {
  return await TreatmentRepository.deleteTreatment(id);
};

module.exports = {
  getAllTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  deleteTreatment,
}; 