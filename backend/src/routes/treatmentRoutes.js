const express = require('express');
const treatmentController = require('../controllers/treatmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', treatmentController.createTreatment);
router.get('/patient/:patientId', treatmentController.getPatientTreatments);
router.patch('/:id', treatmentController.updateTreatment);
router.delete('/:id', treatmentController.deleteTreatment);

module.exports = router;
