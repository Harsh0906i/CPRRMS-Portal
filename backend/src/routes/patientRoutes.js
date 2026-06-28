const express = require('express');
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const uploadPatientPhoto = require("../middleware/uploadPatientPhoto");

const {
  uploadPatientPhoto: uploadPatientPhotoController,
  getPatientPhotos,
} = require("../controllers/patientPhotoController");

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

// Upload Cancer Photo
router.post(
  "/:patientId/photos",
  uploadPatientPhoto.single("photo"),
  uploadPatientPhotoController
);

// Get All Cancer Photos
router.get(
  "/:patientId/photos",
  getPatientPhotos
);

router.post(
  "/:patientId/photos",
  uploadPatientPhoto.single("photo"),
  uploadPatientPhotoController
);

module.exports = router;
