const Patient = require('../models/Patient');
const CancerDetails = require('../models/CancerDetails');
const Treatment = require('../models/Treatment');
const Report = require('../models/Report');
const Receipt = require('../models/Receipt');
const AppError = require('../utils/appError');
const logAudit = require('../utils/auditLogger');

// Create new patient (along with optional cancer registry details)
exports.createPatient = async (req, res, next) => {
  try {
    const {
      name,
      dob,
      gender,
      bloodGroup,
      contactNumber,
      email,
      address,
      emergencyContact,
      cancerType,
      stage,
      diagnosisDate,
      primaryPhysician,
      clinicalStatus
    } = req.body;

    // 1) Create Patient base record
    const newPatient = await Patient.create({
      name,
      dob,
      gender,
      bloodGroup,
      contactNumber,
      email,
      address,
      emergencyContact,
      registeredBy: req.user._id
    });

    // 2) If cancer details are provided, create CancerDetails record
    let newCancerDetails = null;
    if (cancerType && stage && diagnosisDate && primaryPhysician) {
      newCancerDetails = await CancerDetails.create({
        patient: newPatient._id,
        cancerType,
        stage,
        diagnosisDate,
        primaryPhysician,
        status: clinicalStatus || 'Active Treatment'
      });
    }

    // 3) Audit Log
    await logAudit(req.user._id, 'CREATE_PATIENT', req.ip, {
      patientId: newPatient.patientId,
      name: newPatient.name
    });

    res.status(201).json({
      status: 'success',
      data: {
        patient: newPatient,
        cancerDetails: newCancerDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all patients with filters, search, pagination and sorting
exports.getAllPatients = async (req, res, next) => {
  try {
    const queryFilter = {};

    // 1) Text Search (matches name, patientId, phone, email)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryFilter.$or = [
        { name: searchRegex },
        { patientId: searchRegex },
        { contactNumber: searchRegex },
        { email: searchRegex }
      ];
    }

    // 2) Demographics Filters
    if (req.query.gender) {
      queryFilter.gender = req.query.gender;
    }
    if (req.query.state) {
      queryFilter['address.state'] = { $regex: new RegExp(req.query.state, 'i') };
    }
    if (req.query.district) {
      queryFilter['address.district'] = { $regex: new RegExp(req.query.district, 'i') };
    }

    // 3) Age Filter (minAge / maxAge)
    if (req.query.minAge || req.query.maxAge) {
      const currentYear = new Date().getFullYear();
      const minAge = parseInt(req.query.minAge, 10) || 0;
      const maxAge = parseInt(req.query.maxAge, 10) || 120;

      const maxDob = new Date();
      maxDob.setFullYear(currentYear - minAge);
      const minDob = new Date();
      minDob.setFullYear(currentYear - maxAge - 1);

      queryFilter.dob = { $gte: minDob, $lte: maxDob };
    }

    // 4) Cancer Registry Filters (requires fetching matching patients from CancerDetails)
    const cancerFilter = {};
    if (req.query.cancerType) {
      cancerFilter.cancerType = req.query.cancerType;
    }
    if (req.query.stage) {
      cancerFilter.stage = req.query.stage;
    }
    if (req.query.primaryPhysician) {
      cancerFilter.primaryPhysician = { $regex: new RegExp(req.query.primaryPhysician, 'i') };
    }
    if (req.query.diagnosisDate) {
      cancerFilter.diagnosisDate = { $gte: new Date(req.query.diagnosisDate) };
    }

    if (Object.keys(cancerFilter).length > 0) {
      const matchedCancers = await CancerDetails.find(cancerFilter).select('patient');
      const patientIds = matchedCancers.map(doc => doc.patient);

      if (queryFilter._id) {
        // Find intersection of IDs
        const existingIds = Array.isArray(queryFilter._id.$in) ? queryFilter._id.$in : [];
        queryFilter._id = {
          $in: existingIds.filter(id => patientIds.some(pid => pid.toString() === id.toString()))
        };
      } else {
        queryFilter._id = { $in: patientIds };
      }
    }

    // 5) Treatment Type Filter
    if (req.query.treatmentType) {
      const matchedTreatments = await Treatment.find({
        treatmentType: req.query.treatmentType
      }).select('patient');
      const patientIds = matchedTreatments.map(doc => doc.patient);

      if (queryFilter._id) {
        const existingIds = Array.isArray(queryFilter._id.$in) ? queryFilter._id.$in : [];
        queryFilter._id = {
          $in: existingIds.filter(id => patientIds.some(pid => pid.toString() === id.toString()))
        };
      } else {
        queryFilter._id = { $in: patientIds };
      }
    }

    // 6) Pagination & Sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Execute query
    const patients = await Patient.find(queryFilter)
      .populate('cancerDetails')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total document count for pagination calculations
    const total = await Patient.countDocuments(queryFilter);

    res.status(200).json({
      status: 'success',
      results: patients.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: {
        patients
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single patient profile (fully populated)
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('cancerDetails')
      .populate({
        path: 'treatments',
        options: { sort: { startDate: -1 } }
      })
      .populate({
        path: 'reports',
        options: { sort: { createdAt: -1 } }
      })
      .populate({
        path: 'receipts',
        options: { sort: { createdAt: -1 } }
      });

    if (!patient) {
      return next(new AppError('No patient found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        patient
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update Patient
exports.updatePatient = async (req, res, next) => {
  try {
    const {
      name,
      dob,
      gender,
      bloodGroup,
      contactNumber,
      email,
      address,
      emergencyContact,
      // Cancer details fields
      cancerType,
      stage,
      diagnosisDate,
      primaryPhysician,
      clinicalStatus
    } = req.body;

    // 1) Find patient first
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return next(new AppError('No patient found with that ID', 404));
    }

    // 2) Update patient fields
    if (name) patient.name = name;
    if (dob) patient.dob = dob;
    if (gender) patient.gender = gender;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (contactNumber) patient.contactNumber = contactNumber;
    if (email !== undefined) patient.email = email;
    if (address) patient.address = { ...patient.address, ...address };
    if (emergencyContact) patient.emergencyContact = { ...patient.emergencyContact, ...emergencyContact };

    await patient.save();

    // 3) Update or Create Cancer Details
    let cancerDetails = await CancerDetails.findOne({ patient: patient._id });
    if (cancerDetails) {
      if (cancerType) cancerDetails.cancerType = cancerType;
      if (stage) cancerDetails.stage = stage;
      if (diagnosisDate) cancerDetails.diagnosisDate = diagnosisDate;
      if (primaryPhysician) cancerDetails.primaryPhysician = primaryPhysician;
      if (clinicalStatus) cancerDetails.status = clinicalStatus;
      await cancerDetails.save();
    } else if (cancerType && stage && diagnosisDate && primaryPhysician) {
      // Create new details if none existed
      cancerDetails = await CancerDetails.create({
        patient: patient._id,
        cancerType,
        stage,
        diagnosisDate,
        primaryPhysician,
        status: clinicalStatus || 'Active Treatment'
      });
    }

    // 4) Audit Log
    await logAudit(req.user._id, 'UPDATE_PATIENT', req.ip, {
      patientId: patient.patientId,
      name: patient.name
    });

    res.status(200).json({
      status: 'success',
      data: {
        patient,
        cancerDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// Hard delete patient and all cascade items (Treatments, Reports, Receipts, CancerDetails)
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return next(new AppError('No patient found with that ID', 404));
    }

    // Perform cascades
    await CancerDetails.deleteMany({ patient: patient._id });
    await Treatment.deleteMany({ patient: patient._id });
    await Report.deleteMany({ patient: patient._id });
    await Receipt.deleteMany({ patient: patient._id });

    // Delete patient
    await Patient.findByIdAndDelete(patient._id);

    // Audit Log
    await logAudit(req.user._id, 'DELETE_PATIENT', req.ip, {
      patientId: patient.patientId,
      name: patient.name
    });

    res.status(200).json({
      status: 'success',
      message: 'Patient and all associated records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
