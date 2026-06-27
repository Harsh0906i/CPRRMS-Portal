const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      unique: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required']
    },
    amount: {
      type: Number,
      required: [true, 'Please specify the payment amount'],
      min: [0, 'Amount cannot be negative']
    },
    paymentMode: {
      type: String,
      required: [true, 'Please specify the payment mode'],
      enum: ['Cash', 'Card', 'UPI', 'Net Banking']
    },
    description: {
      type: String,
      required: [true, 'Please provide payment details or description'],
      trim: true
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Generator user reference is required']
    },
    pdfUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate receiptNumber
receiptSchema.pre('save', async function (next) {
  if (this.receiptNumber) return next();

  try {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
      }
    });

    const sequence = String(count + 1).padStart(4, '0');
    this.receiptNumber = `REC-${year}-${sequence}`;
    next();
  } catch (error) {
    next(error);
  }
});

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
