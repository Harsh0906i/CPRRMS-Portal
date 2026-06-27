const express = require('express');
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/', upload.single('file'), reportController.uploadReport);
router.post('/:id/new-version', upload.single('file'), reportController.createNewVersion);
router.get('/:id/history', reportController.getReportHistory);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
