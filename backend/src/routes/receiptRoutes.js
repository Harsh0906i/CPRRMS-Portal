const express = require('express');
const receiptController = require('../controllers/receiptController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', receiptController.createReceipt);
router.get('/', receiptController.getAllReceipts);
router.get('/:id/pdf', receiptController.getReceiptPdf);

module.exports = router;
