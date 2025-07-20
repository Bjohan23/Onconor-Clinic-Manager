const PrescriptionService = require('../services/prescriptionService');

const getAll = async (req, res) => {
  const prescriptions = await PrescriptionService.getAllPrescriptions();
  res.json(prescriptions);
};

const getById = async (req, res) => {
  const prescription = await PrescriptionService.getPrescriptionById(req.params.id);
  if (!prescription) return res.status(404).json({ message: 'Not found' });
  res.json(prescription);
};

const create = async (req, res) => {
  const prescription = await PrescriptionService.createPrescription(req.body);
  res.status(201).json(prescription);
};

const update = async (req, res) => {
  const prescription = await PrescriptionService.updatePrescription(req.params.id, req.body);
  if (!prescription) return res.status(404).json({ message: 'Not found' });
  res.json(prescription);
};

const remove = async (req, res) => {
  const deleted = await PrescriptionService.deletePrescription(req.params.id);
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