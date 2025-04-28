const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const stockRoutes = require('./routes/stockRoutes');
const alertRoutes = require('./routes/alertRoutes');

// Import Firebase utilities
const { initializeFirebase } = require('./utils/firebase');
const { authenticate } = require('./middlewares/auth');

// Load environment variables
dotenv.config();

// Initialize Firebase
initializeFirebase();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Stock Index Values Tracker API' });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Register route handlers
app.use('/api/stocks', stockRoutes);
app.use('/api/alerts', authenticate, alertRoutes); // Protected route

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 