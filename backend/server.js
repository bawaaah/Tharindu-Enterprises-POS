require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/reports');
const authMiddleware = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Production-specific settings
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust proxy for secure environments
  app.use((req, res, next) => {
    // Basic request logging
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api/admin', adminRoutes); // Login route is public
app.use('/api', authMiddleware); // Protect all other API routes
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - Error:`, err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} in ${process.env.NODE_ENV} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down.');
    process.exit(0);
  });
});