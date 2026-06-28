const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Please provide the patient\'s name'],
      trim: true
    },
    dob: {
      type: Date,
      required: [true, 'Please provide date of birth']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Please provide gender']
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    contactNumber: {
      type: String,
      required: [true, 'Please provide a contact number'],
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      district: { type: String, required: [true, 'District is required'], trim: true },
      state: { type: String, required: [true, 'State is required'], trim: true },
      pinCode: { type: String, required: [true, 'PIN code is required'], trim: true }
    },
    emergencyContact: {
      name: { type: String, required: [true, 'Emergency contact name is required'], trim: true },
      relationship: { type: String, required: [true, 'Emergency contact relationship is required'], trim: true },
      contactNumber: { type: String, required: [true, 'Emergency contact number is required'], trim: true }
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Registered by user is required']
    },
    cancerPhotos: [
      {
        imageUrl: {
          type: String,
          required: true
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for Cancer Details, Treatments, Reports, Receipts
patientSchema.virtual('cancerDetails', {
  ref: 'CancerDetails',
  foreignField: 'patient',
  localField: '_id',
  justOne: true
});

patientSchema.virtual('treatments', {
  ref: 'Treatment',
  foreignField: 'patient',
  localField: '_id'
});

patientSchema.virtual('reports', {
  ref: 'Report',
  foreignField: 'patient',
  localField: '_id'
});

patientSchema.virtual('receipts', {
  ref: 'Receipt',
  foreignField: 'patient',
  localField: '_id'
});

// Auto-generate patientId
patientSchema.pre('save', async function (next) {
  if (this.patientId) return next();

  try {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
      }
    });

    const sequence = String(count + 1).padStart(4, '0');
    this.patientId = `ICSR-${year}-${sequence}`;
    next();
  } catch (error) {
    next(error);
  }
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
