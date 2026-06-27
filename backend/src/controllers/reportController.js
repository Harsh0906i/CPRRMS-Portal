const Report = require('../models/Report');
const Patient = require('../models/Patient');
const AppError = require('../utils/appError');
const logAudit = require('../utils/auditLogger');
const { uploadFile, deleteFile } = require('../services/cloudinaryService');

// Upload a new report for a patient (Version 1)
exports.uploadReport = async (req, res, next) => {
  try {
    const { patientId, reportName, reportType } = req.body;

    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return next(new AppError('No patient found with that ID', 404));
    }

    // Upload to Cloudinary / local storage
    const storageResult = await uploadFile(req.file.path, 'cprrms_reports');

    const newReport = await Report.create({
      patient: patientId,
      reportName: reportName || req.file.originalname,
      reportType,
      fileUrl: storageResult.fileUrl,
      publicId: storageResult.publicId,
      uploadedBy: req.user._id,
      version: 1
    });

    // Audit Log
    await logAudit(req.user._id, 'UPLOAD_REPORT', req.ip, {
      patientId: patient.patientId,
      reportId: newReport._id,
      reportName: newReport.reportName
    });

    res.status(201).json({
      status: 'success',
      data: {
        report: newReport
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload a newer version of an existing report
exports.createNewVersion = async (req, res, next) => {
  try {
    const { id } = req.params; // ID of the previous version report
    const { reportName } = req.body;

    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    // Find the report to update
    const previousReport = await Report.findById(id);
    if (!previousReport) {
      return next(new AppError('The report you are updating does not exist', 404));
    }

    // The primary parent is either the previous report's parent or the previous report itself
    const parentId = previousReport.parentReport || previousReport._id;

    // Get the maximum version number for this lineage
    const maxVersionDoc = await Report.findOne({
      $or: [{ _id: parentId }, { parentReport: parentId }]
    }).sort({ version: -1 });

    const newVersionNumber = (maxVersionDoc ? maxVersionDoc.version : previousReport.version) + 1;

    // Upload new file
    const storageResult = await uploadFile(req.file.path, 'cprrms_reports');

    const newReport = await Report.create({
      patient: previousReport.patient,
      reportName: reportName || previousReport.reportName,
      reportType: previousReport.reportType,
      fileUrl: storageResult.fileUrl,
      publicId: storageResult.publicId,
      uploadedBy: req.user._id,
      version: newVersionNumber,
      parentReport: parentId
    });

    const patient = await Patient.findById(previousReport.patient);

    // Audit Log
    await logAudit(req.user._id, 'UPLOAD_REPORT_VERSION', req.ip, {
      patientId: patient ? patient.patientId : previousReport.patient,
      reportId: newReport._id,
      version: newVersionNumber
    });

    res.status(201).json({
      status: 'success',
      data: {
        report: newReport
      }
    });
  } catch (error) {
    next(error);
  }
};

// Fetch version history for a given report ID
exports.getReportHistory = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return next(new AppError('No report found with that ID', 404));
    }

    const parentId = report.parentReport || report._id;

    // Get all versions of this report, sorting newest to oldest
    const history = await Report.find({
      $or: [{ _id: parentId }, { parentReport: parentId }]
    })
      .populate('uploadedBy', 'name email role')
      .sort({ version: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        history
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a specific report file and database entry
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return next(new AppError('No report found with that ID', 404));
    }

    // Delete from Cloudinary / local storage
    await deleteFile(report.publicId);

    // Delete database record
    await Report.findByIdAndDelete(report._id);

    const patient = await Patient.findById(report.patient);

    // Audit Log
    await logAudit(req.user._id, 'DELETE_REPORT', req.ip, {
      patientId: patient ? patient.patientId : report.patient,
      reportName: report.reportName
    });

    res.status(200).json({
      status: 'success',
      message: 'Report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
