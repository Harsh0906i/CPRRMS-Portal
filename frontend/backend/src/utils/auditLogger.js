const AuditLog = require('../models/AuditLog');

/**
 * Logs an administrative action in the AuditLog collection.
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action name (e.g. CREATE_PATIENT, DELETE_REPORT)
 * @param {string} ipAddress - Request IP address
 * @param {Object} details - Additional structured change details
 */
const logAudit = async (userId, action, ipAddress = '', details = {}) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      ipAddress,
      details
    });
  } catch (error) {
    // Log the error but don't break the application flow
    console.error(`Audit logging failed: ${error.message}`);
  }
};

module.exports = logAudit;
