const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const reportRoutes = require('./routes/reportRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local file uploads in browser
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Implement CORS - allow frontend to connect with credentials
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Serve static local uploads directory (for local file fallback)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Simple Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CPRRMS API is running smoothly',
    timestamp: new Date()
  });
});

// 2) ROUTE MOUNTINGS
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/analytics', analyticsRoutes);

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
