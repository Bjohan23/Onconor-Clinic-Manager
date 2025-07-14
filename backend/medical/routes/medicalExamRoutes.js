const express = require('express');
const router = express.Router();
const MedicalExamController = require('../controllers/medicalExamController');

router.get('/', MedicalExamController.getAll);
router.get('/:id', MedicalExamController.getById);
router.post('/', MedicalExamController.create);
router.put('/:id', MedicalExamController.update);
router.delete('/:id', MedicalExamController.remove);

module.exports = router; 