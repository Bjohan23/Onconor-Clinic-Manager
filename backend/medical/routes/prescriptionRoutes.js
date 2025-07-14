const express = require('express');
const router = express.Router();
const PrescriptionController = require('../controllers/prescriptionController');

router.get('/', PrescriptionController.getAll);
router.get('/:id', PrescriptionController.getById);
router.post('/', PrescriptionController.create);
router.put('/:id', PrescriptionController.update);
router.delete('/:id', PrescriptionController.remove);

module.exports = router; 