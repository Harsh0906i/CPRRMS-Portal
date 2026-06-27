const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const logAudit = require('../utils/auditLogger');

// Helper to sign JWT Access Token
const signAccessToken = id => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  });
};

// Helper to sign JWT Refresh Token
const signRefreshToken = id => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

// Send response containing access token and cookie containing refresh token
const createSendToken = async (user, statusCode, req, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Save refresh token to user record (selectively)
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Refresh Token Options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'Lax'
  };

  res.cookie('jwt_refresh', refreshToken, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.refreshToken = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    data: {
      user
    }
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists & password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3) Check if user is active
    if (user.status === 'Inactive') {
      return next(new AppError('Your account has been deactivated. Contact Super Admin.', 403));
    }

    // 4) Log the successful login
    await logAudit(user._id, 'USER_LOGIN', req.ip, { email: user.email });

    // 5) If everything ok, send token to client
    await createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // If we have req.user from protection middleware, we can remove refresh token
    if (req.cookies && req.cookies.jwt_refresh) {
      const token = req.cookies.jwt_refresh;
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshToken = undefined;
          await user.save({ validateBeforeSave: false });
          await logAudit(user._id, 'USER_LOGOUT', req.ip);
        }
      } catch (err) {
        // Token was expired or invalid; ignore and clear cookie
      }
    }

    res.clearCookie('jwt_refresh', {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'Lax'
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt_refresh;

    if (!token) {
      return next(new AppError('No refresh token provided', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Check if user still exists and has matching refresh token
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return next(new AppError('Invalid or expired refresh token. Please login again.', 401));
    }

    if (user.status === 'Inactive') {
      return next(new AppError('This user account has been deactivated.', 403));
    }

    // Generate new Access Token
    const accessToken = signAccessToken(user._id);

    res.status(200).json({
      status: 'success',
      token: accessToken
    });
  } catch (error) {
    next(new AppError('Refresh token is invalid or expired. Please login again.', 401));
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't tell the client if the email exists. Just return success message.
      return res.status(200).json({
        status: 'success',
        message: 'If the account exists, a reset link has been generated.'
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash it and set expiry (10 minutes)
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    await user.save({ validateBeforeSave: false });

    // In production, we'd send an email. For this implementation, we log the reset link to console and return it in the response for test purposes.
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    console.log(`[PASSWORD RESET LINK]: ${resetURL}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset link generated successfully.',
      // Provided only for convenience during testing/development
      resetURL
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return next(new AppError('Please provide a new password', 400));
    }

    // Hash the token sent in the URL params
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with matching token and unexpired reset window
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await logAudit(user._id, 'PASSWORD_RESET', req.ip);

    // Send JWT and log the user in directly
    await createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};
