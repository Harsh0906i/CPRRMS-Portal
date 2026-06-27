const mongoose = require('mongoose');

const cancerDetailsSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
      unique: true
    },
    cancerType: {
      type: String,
      required: [true, 'Please select a cancer type'],
      enum: {
        values: [
          'Blood Cancer',
          'Lung Cancer',
          'Breast Cancer',
          'Oral Cancer',
          'Liver Cancer',
          'Brain Cancer',
          'Other'
        ],
        message: 'Invalid cancer type category'
      }
    },
    stage: {
      type: String,
      required: [true, 'Please select a cancer stage'],
      enum: {
        values: ['Stage 0', 'Stage I', 'Stage II', 'Stage III', 'Stage IV', 'Unknown'],
        message: 'Invalid cancer stage'
      }
    },
    diagnosisDate: {
      type: Date,
      required: [true, 'Please provide diagnosis date']
    },
    primaryPhysician: {
      type: String,
      required: [true, 'Primary physician oncologist is required'],
      trim: true
    },
    status: {
      type: String,
      required: [true, 'Patient clinical status is required'],
      enum: ['Active Treatment', 'Remission', 'Relapsed', 'Palliative', 'Deceased'],
      default: 'Active Treatment'
    }
  },
  {
    timestamps: true
  }
);

const CancerDetails = mongoose.model('CancerDetails', cancerDetailsSchema);

module.exports = CancerDetails;
