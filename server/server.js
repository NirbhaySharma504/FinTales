const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Server port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`
  ========================================
   FinTales API Server
  ========================================
   🚀 Server running in ${process.env.NODE_ENV} mode
   🔗 API available at http://localhost:${PORT}
   📚 Documentation at http://localhost:${PORT}/api/docs
   📝 MongoDB connected
  ========================================
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  // Exit process
  process.exit(1);
});
