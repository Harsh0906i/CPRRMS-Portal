const Patient = require("../models/Patient");
const path = require("path");

// Upload Patient Cancer Photo
exports.uploadPatientPhoto = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check patient exists
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Check file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    // Save relative image path
    const imagePath = path.join(
      "uploads",
      "patients",
      patientId,
      req.file.filename
    );

    // Add photo to patient's cancerPhotos array
    patient.cancerPhotos.push({
      imageUrl: imagePath,
      uploadedAt: new Date(),
    });

    await patient.save();

    res.status(200).json({
      success: true,
      message: "Cancer photo uploaded successfully.",
      photo: {
        imageUrl: imagePath,
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to upload photo.",
    });
  }
};

// Get All Cancer Photos of a Patient
exports.getPatientPhotos = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check if patient exists
    const patient = await Patient.findById(patientId).select("cancerPhotos");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      totalPhotos: patient.cancerPhotos.length,
      photos: patient.cancerPhotos,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch patient photos.",
    });
  }
};