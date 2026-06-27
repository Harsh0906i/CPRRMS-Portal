const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const AppError = require('../utils/appError');
const logAudit = require('../utils/auditLogger');

// Get all staff users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new staff user (Admin / Super Admin)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email address is already in use', 400));
    }

    const newUser = await User.create({
      name,
      email,
      password, // Pre-save hooks will encrypt
      role: role || 'Admin'
    });

    // Remove password from response
    newUser.password = undefined;

    // Audit Log
    await logAudit(req.user._id, 'CREATE_STAFF', req.ip, {
      newUserId: newUser._id,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user role, status or details
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    // Prevent Super Admin from changing their own role or deactivating themselves
    if (req.user._id.toString() === user._id.toString()) {
      if (role && role !== user.role) {
        return next(new AppError('You cannot change your own role!', 400));
      }
      if (status && status === 'Inactive') {
        return next(new AppError('You cannot deactivate your own account!', 400));
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    user.password = undefined;

    // Audit Log
    await logAudit(req.user._id, 'UPDATE_STAFF', req.ip, {
      updatedUserId: user._id,
      email: user.email,
      role: user.role,
      status: user.status
    });

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account (or clean remove)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    // Prevent self deletion
    if (req.user._id.toString() === user._id.toString()) {
      return next(new AppError('You cannot delete your own account!', 400));
    }

    await User.findByIdAndDelete(req.params.id);

    // Audit Log
    await logAudit(req.user._id, 'DELETE_STAFF', req.ip, {
      deletedEmail: user.email
    });

    res.status(200).json({
      status: 'success',
      message: 'Staff user deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve paginated system audit logs (Super Admin exclusive)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const queryFilter = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryFilter.$or = [
        { action: searchRegex }
      ];
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(queryFilter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(queryFilter);

    res.status(200).json({
      status: 'success',
      results: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: {
        logs
      }
    });
  } catch (error) {
    next(error);
  }
};
