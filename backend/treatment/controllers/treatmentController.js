const TreatmentService = require('../services/treatmentService');

const getAll = async (req, res) => {
  const treatments = await TreatmentService.getAllTreatments();
  res.json(treatments);
};

const getById = async (req, res) => {
  const treatment = await TreatmentService.getTreatmentById(req.params.id);
  if (!treatment) return res.status(404).json({ message: 'Not found' });
  res.json(treatment);
};

const create = async (req, res) => {
  const treatment = await TreatmentService.createTreatment(req.body);
  res.status(201).json(treatment);
};

const update = async (req, res) => {
  const treatment = await TreatmentService.updateTreatment(req.params.id, req.body);
  if (!treatment) return res.status(404).json({ message: 'Not found' });
  res.json(treatment);
};

const remove = async (req, res) => {
  const deleted = await TreatmentService.deleteTreatment(req.params.id);
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