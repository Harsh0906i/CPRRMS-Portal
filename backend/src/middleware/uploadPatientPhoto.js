const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const patientId = req.params.patientId;

    const uploadPath = path.join(
      __dirname,
      "../../uploads/patients",
      patientId
    );

    // Folder doesn't exist? Create it.
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName = `photo-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const uploadPatientPhoto = multer({
  storage,
  fileFilter,
});

module.exports = uploadPatientPhoto;