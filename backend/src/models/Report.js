const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required']
    },
    reportName: {
      type: String,
      required: [true, 'Please provide the report name'],
      trim: true
    },
    reportType: {
      type: String,
      required: [true, 'Please specify the report type'],
      enum: ['Pathology', 'Radiology', 'Blood Work', 'Biopsy', 'Other']
    },
    fileUrl: {
      type: String,
      required: [true, 'Report file URL is required']
    },
    publicId: {
      type: String,
      required: [true, 'Report file storage public ID is required']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required']
    },
    version: {
      type: Number,
      default: 1
    },
    parentReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
