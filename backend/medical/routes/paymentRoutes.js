const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

router.get('/', PaymentController.getAll);
router.get('/:id', PaymentController.getById);
router.post('/', PaymentController.create);
router.put('/:id', PaymentController.update);
router.delete('/:id', PaymentController.remove);

module.exports = router; 