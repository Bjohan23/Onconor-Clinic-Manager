const express = require('express');
const router = express.Router();
const TreatmentController = require('../controllers/treatmentController');

router.get('/', TreatmentController.getAll);
router.get('/:id', TreatmentController.getById);
router.post('/', TreatmentController.create);
router.put('/:id', TreatmentController.update);
router.delete('/:id', TreatmentController.remove);

module.exports = router; 