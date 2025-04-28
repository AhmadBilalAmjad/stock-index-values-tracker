const express = require('express');
const router = express.Router();
const { setAlerts, getAlerts } = require('../utils/alertCron');

// Store alerts in memory for demo purposes
// In a real app, these would be stored in a database
let alerts = [];

// Initialize alerts in the cron utility
setAlerts(alerts);

// Get all alerts for a user
router.get('/', (req, res) => {
  // In a real app, we would authenticate the user and get their ID
  // For demo, we'll use a placeholder userId
  const userId = req.query.userId || 'demo-user@gmail.com';

  const userAlerts = alerts.filter(alert => alert.userId === userId);
  res.json({ success: true, data: userAlerts });
});

// Create a new alert
router.post('/', (req, res) => {
  const { userId = 'demo-user', symbol, threshold, direction, email } = req.body;

  if (!symbol || !threshold || !direction || !email) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields. Please provide symbol, threshold, direction, and email.'
    });
  }

  // Validate direction
  if (!['above', 'below'].includes(direction)) {
    return res.status(400).json({
      success: false,
      error: 'Direction must be either "above" or "below".'
    });
  }

  const newAlert = {
    id: Date.now().toString(),
    userId,
    symbol,
    threshold: parseFloat(threshold),
    direction,
    email,
    createdAt: new Date().toISOString(),
    active: true
  };

  alerts.push(newAlert);

  // Update alerts in the cron utility
  setAlerts(alerts);

  res.status(201).json({ success: true, data: newAlert });
});

// Delete an alert
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const alertIndex = alerts.findIndex(alert => alert.id === id);

  if (alertIndex === -1) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }

  alerts.splice(alertIndex, 1);

  // Update alerts in the cron utility
  setAlerts(alerts);

  res.json({ success: true, message: 'Alert deleted successfully' });
});

// Toggle alert status (active/inactive)
router.patch('/:id/toggle', (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId || 'demo-user';

  const alert = alerts.find(alert => alert.id === id && alert.userId === userId);

  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }

  alert.active = !alert.active;

  // Update alerts in the cron utility
  setAlerts(alerts);

  res.json({ success: true, data: alert });
});

module.exports = router; 