const cron = require('node-cron');
const { getStockQuote } = require('./finnhub');
const { sendAlertEmail } = require('./emailService');

// Store alerts in memory (in a real app, this would be in a database)
// This is imported from alertRoutes.js
let alerts = [];

// Set the alerts array from the routes
const setAlerts = (alertsArray) => {
  alerts = alertsArray;
};

// Get the alerts array
const getAlerts = () => {
  return alerts;
};

// Check if a price threshold has been crossed
const checkThreshold = (alert, currentPrice) => {
  if (alert.direction === 'above' && currentPrice > alert.threshold) {
    return true;
  } else if (alert.direction === 'below' && currentPrice < alert.threshold) {
    return true;
  }
  return false;
};

// Process all active alerts
const processAlerts = async () => {
  console.log(`Processing alerts at ${new Date().toISOString()}`);

  // Filter active alerts
  const activeAlerts = alerts.filter(alert => alert.active);

  if (activeAlerts.length === 0) {
    console.log('No active alerts to process');
    return;
  }

  console.log(`Processing ${activeAlerts.length} active alerts`);

  // Process each alert
  for (const alert of activeAlerts) {
    try {
      // Get current stock price
      const quote = await getStockQuote(alert.symbol);
      const currentPrice = quote.c;

      // Check if threshold is crossed
      if (checkThreshold(alert, currentPrice)) {
        console.log(`Threshold crossed for ${alert.symbol}: ${currentPrice} ${alert.direction} ${alert.threshold}`);

        // Send email alert
        await sendAlertEmail(alert, currentPrice);

        // In a real app, you might want to update the alert status or add a notification history
        // For example: mark as triggered, add a cooldown period, etc.
      }
    } catch (error) {
      console.error(`Error processing alert for ${alert.symbol}:`, error);
    }
  }
};

// Start the cron job
const startAlertCron = () => {
  // Run every 1 minutes
  cron.schedule('*/1 * * * *', async () => {
    await processAlerts();
  });

  console.log('Alert cron job started - checking every minute');
};

module.exports = {
  setAlerts,
  getAlerts,
  startAlertCron,
  processAlerts
}; 