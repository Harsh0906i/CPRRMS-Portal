const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required']
    },
    treatmentType: {
      type: String,
      required: [true, 'Please select treatment type'],
      enum: {
        values: [
          'Chemotherapy',
          'Radiation',
          'Surgery',
          'Immunotherapy',
          'Targeted Therapy',
          'Hormonal Therapy'
        ],
        message: 'Invalid treatment type category'
      }
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide treatment start date']
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      required: [true, 'Please select treatment status'],
      enum: ['Active', 'Completed', 'Discontinued', 'Pending'],
      default: 'Active'
    },
    cycleNumber: {
      type: Number,
      default: 1
    },
    dosage: {
      type: String,
      trim: true
    },
    treatingDoctor: {
      type: String,
      required: [true, 'Treating oncologist name is required'],
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    followUpDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Treatment = mongoose.model('Treatment', treatmentSchema);

module.exports = Treatment;
