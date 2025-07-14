const Treatment = require('../models/treatment');

const getAllTreatments = async () => {
  return await Treatment().findAll();
};

const getTreatmentById = async (id) => {
  return await Treatment().findByPk(id);
};

const createTreatment = async (data) => {
  return await Treatment().create(data);
};

const updateTreatment = async (id, data) => {
  const treatment = await Treatment().findByPk(id);
  if (!treatment) return null;
  return await treatment.update(data);
};

const deleteTreatment = async (id) => {
  const treatment = await Treatment().findByPk(id);
  if (!treatment) return null;
  await treatment.destroy();
  return true;
};

module.exports = {
  getAllTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  deleteTreatment,
}; 