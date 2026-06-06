const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const initDb = require('./models/schema');
const apiRoutes = require('./routes/api');
const listenForDeposits = require('./middleware/web3Listener');
const { swaggerUi, specs } = require('./config/swagger');

// Initialize Database
initDb();

// Start Web3 Listener
listenForDeposits();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on our end.' 
  });
});

app.listen(PORT, () => {
  console.log(`[GOLDTRUST BACKEND] Operational on port ${PORT}`);
});
