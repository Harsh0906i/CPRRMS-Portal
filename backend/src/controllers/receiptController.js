const Receipt = require('../models/Receipt');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { generateReceiptPDF } = require('../services/pdfService');
const AppError = require('../utils/appError');
const logAudit = require('../utils/auditLogger');

// Generate a new patient receipt record
exports.createReceipt = async (req, res, next) => {
  try {
    const { patientId, amount, paymentMode, description } = req.body;

    if (!patientId || !amount || !paymentMode || !description) {
      return next(new AppError('Please provide patientId, amount, paymentMode, and description', 400));
    }

    // 1) Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return next(new AppError('No patient found with that ID', 404));
    }

    // 2) Create the receipt record in DB
    const receipt = await Receipt.create({
      patient: patientId,
      amount,
      paymentMode,
      description,
      generatedBy: req.user._id
    });

    // 3) Audit Log
    await logAudit(req.user._id, 'GENERATE_RECEIPT', req.ip, {
      patientId: patient.patientId,
      receiptNumber: receipt.receiptNumber,
      amount
    });

    res.status(201).json({
      status: 'success',
      data: {
        receipt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve receipts history with filters and pagination
exports.getAllReceipts = async (req, res, next) => {
  try {
    const queryFilter = {};

    // 1) Filter by specific Patient
    if (req.query.patientId) {
      queryFilter.patient = req.query.patientId;
    }

    // 2) Search by receipt number or payment mode
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryFilter.$or = [
        { receiptNumber: searchRegex },
        { paymentMode: searchRegex },
        { description: searchRegex }
      ];
    }

    // 3) Pagination & sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const receipts = await Receipt.find(queryFilter)
      .populate('patient', 'name patientId contactNumber')
      .populate('generatedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Receipt.countDocuments(queryFilter);

    res.status(200).json({
      status: 'success',
      results: receipts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: {
        receipts
      }
    });
  } catch (error) {
    next(error);
  }
};

// Stream generated PDF receipt to client
exports.getReceiptPdf = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return next(new AppError('No receipt found with that ID', 404));
    }

    // Fetch related patient and user models
    const patient = await Patient.findById(receipt.patient);
    if (!patient) {
      return next(new AppError('The patient associated with this receipt was not found', 404));
    }

    const user = await User.findById(receipt.generatedBy);
    if (!user) {
      return next(new AppError('The staff member who generated this receipt was not found', 404));
    }

    // Set headers for inline PDF streaming
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=receipt-${receipt.receiptNumber}.pdf`
    );

    // Stream PDF directly to client response
    generateReceiptPDF(receipt, patient, user, res);
  } catch (error) {
    next(error);
  }
};
