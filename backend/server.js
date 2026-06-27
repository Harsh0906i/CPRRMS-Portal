const dotenv = require('dotenv');

// Handle uncaught exceptions globally before any execution
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});

// Load env variables
dotenv.config();

const connectDB = require('./src/config/db');
const app = require('./src/app');

// Connect to Database
connectDB().then(() => {
  const seedSuperAdmin = require('./src/utils/seeder');
  seedSuperAdmin();
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`CPRRMS Server running on port ${port}...`);
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
