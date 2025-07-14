const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoiceController');

router.get('/', InvoiceController.getAll);
router.get('/:id', InvoiceController.getById);
router.post('/', InvoiceController.create);
router.put('/:id', InvoiceController.update);
router.delete('/:id', InvoiceController.remove);

module.exports = router; 