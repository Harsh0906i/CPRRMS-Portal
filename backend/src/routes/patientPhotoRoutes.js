const express = require("express");

const router = express.Router();

const uploadPatientPhoto = require("../middleware/uploadPatientPhoto");

const {
  uploadPatientPhoto: uploadPatientPhotoController,
} = require("../controllers/patientPhotoController");

// Upload Cancer Photo
router.post(
  "/:patientId/photos",
  uploadPatientPhoto.single("photo"),
  uploadPatientPhotoController
);

module.exports = router;