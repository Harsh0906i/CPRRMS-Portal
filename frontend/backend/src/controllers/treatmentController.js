const Treatment = require('../models/Treatment');
const Patient = require('../models/Patient');
const CancerDetails = require('../models/CancerDetails');
const AppError = require('../utils/appError');
const logAudit = require('../utils/auditLogger');

// Add new treatment record for a patient
exports.createTreatment = async (req, res, next) => {
  try {
    const {
      patientId,
      treatmentType,
      startDate,
      endDate,
      status,
      cycleNumber,
      dosage,
      treatingDoctor,
      notes,
      followUpDate
    } = req.body;

    // 1) Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return next(new AppError('No patient found with that ID', 404));
    }

    // 2) Create treatment record
    const treatment = await Treatment.create({
      patient: patientId,
      treatmentType,
      startDate,
      endDate,
      status: status || 'Active',
      cycleNumber,
      dosage,
      treatingDoctor,
      notes,
      followUpDate
    });

    // 3) Update patient status in CancerDetails if the status is active
    if (status === 'Active') {
      await CancerDetails.findOneAndUpdate(
        { patient: patientId },
        { status: 'Active Treatment' }
      );
    }

    // 4) Audit Log
    await logAudit(req.user._id, 'CREATE_TREATMENT', req.ip, {
      patientId: patient.patientId,
      treatmentId: treatment._id,
      treatmentType
    });

    res.status(201).json({
      status: 'success',
      data: {
        treatment
      }
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve all treatments for a specific patient
exports.getPatientTreatments = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const treatments = await Treatment.find({ patient: patientId }).sort({ startDate: -1 });

    res.status(200).json({
      status: 'success',
      results: treatments.length,
      data: {
        treatments
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update treatment record
exports.updateTreatment = async (req, res, next) => {
  try {
    const treatment = await Treatment.findById(req.params.id);
    if (!treatment) {
      return next(new AppError('No treatment record found with that ID', 404));
    }

    const {
      treatmentType,
      startDate,
      endDate,
      status,
      cycleNumber,
      dosage,
      treatingDoctor,
      notes,
      followUpDate
    } = req.body;

    if (treatmentType) treatment.treatmentType = treatmentType;
    if (startDate) treatment.startDate = startDate;
    if (endDate !== undefined) treatment.endDate = endDate;
    if (status) {
      treatment.status = status;
      // Synchronize clinical status if completed/discontinued
      if (status === 'Completed') {
        const activeTreatmentsCount = await Treatment.countDocuments({
          patient: treatment.patient,
          status: 'Active',
          _id: { $ne: treatment._id }
        });
        
        if (activeTreatmentsCount === 0) {
          // If no other treatments are active, update clinical status
          await CancerDetails.findOneAndUpdate(
            { patient: treatment.patient },
            { status: 'Remission' } // Default transition, doctor can override
          );
        }
      }
    }
    if (cycleNumber !== undefined) treatment.cycleNumber = cycleNumber;
    if (dosage !== undefined) treatment.dosage = dosage;
    if (treatingDoctor) treatment.treatingDoctor = treatingDoctor;
    if (notes !== undefined) treatment.notes = notes;
    if (followUpDate !== undefined) treatment.followUpDate = followUpDate;

    await treatment.save();

    const patient = await Patient.findById(treatment.patient);

    // Audit Log
    await logAudit(req.user._id, 'UPDATE_TREATMENT', req.ip, {
      patientId: patient ? patient.patientId : treatment.patient,
      treatmentId: treatment._id
    });

    res.status(200).json({
      status: 'success',
      data: {
        treatment
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete treatment record
exports.deleteTreatment = async (req, res, next) => {
  try {
    const treatment = await Treatment.findById(req.params.id);
    if (!treatment) {
      return next(new AppError('No treatment record found with that ID', 404));
    }

    await Treatment.findByIdAndDelete(req.params.id);

    const patient = await Patient.findById(treatment.patient);

    // Audit Log
    await logAudit(req.user._id, 'DELETE_TREATMENT', req.ip, {
      patientId: patient ? patient.patientId : treatment.patient,
      treatmentType: treatment.treatmentType
    });

    res.status(200).json({
      status: 'success',
      message: 'Treatment record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
