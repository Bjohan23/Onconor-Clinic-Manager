const express = require('express');
const router = express.Router();
const MedicalRecordController = require('../controllers/medicalRecordController');

router.get('/', MedicalRecordController.getAll);
router.get('/:id', MedicalRecordController.getById);
router.post('/', MedicalRecordController.create);
router.put('/:id', MedicalRecordController.update);
router.delete('/:id', MedicalRecordController.remove);

module.exports = router; 