const express = require('express');
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(patientController.getAllPatients)
  .post(patientController.createPatient);

router
  .route('/:id')
  .get(patientController.getPatient)
  .patch(patientController.updatePatient)
  .delete(patientController.deletePatient);

module.exports = router;
