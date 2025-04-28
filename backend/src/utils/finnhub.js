const finnhub = require('finnhub');
const dotenv = require('dotenv');
dotenv.config();

// Configure Finnhub client
const setupFinnhubClient = () => {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    console.warn('Finnhub API key not found. Stock data features will use mock data.');
    return null;
  }

  const api_key = finnhub.ApiClient.instance.authentications['api_key'];
  api_key.apiKey = apiKey;

  console.log('Finnhub intialized with successfully');
  return new finnhub.DefaultApi();
};

const finnhubClient = setupFinnhubClient();

// Track API usage
let apiUsage = {
  totalRequests: 0,
  requestsToday: 0,
  dailyLimit: 60, // Free tier limit per minute
  planLimit: 60 * 24, // Assuming free tier with 60 calls per minute
  lastReset: new Date()
};

// Reset daily usage counter at midnight
const resetDailyUsage = () => {
  const now = new Date();
  if (now.getDate() !== apiUsage.lastReset.getDate()) {
    apiUsage.requestsToday = 0;
    apiUsage.lastReset = now;
  }
};

// Get API usage statistics
const getApiUsage = () => {
  resetDailyUsage();
  return {
    totalRequests: apiUsage.totalRequests,
    requestsToday: apiUsage.requestsToday,
    remainingQuota: apiUsage.planLimit - apiUsage.requestsToday,
    planLimit: apiUsage.planLimit
  };
};

// Increment usage counters
const incrementUsage = () => {
  resetDailyUsage();
  apiUsage.totalRequests++;
  apiUsage.requestsToday++;
};

// Get stock quote for a symbol
const getStockQuote = (symbol) => {
  return new Promise((resolve, reject) => {
    if (!finnhubClient) {
      // Return mock data if no API key
      return resolve(getMockQuote(symbol));
    }

    incrementUsage();
    finnhubClient.quote(symbol, (error, data, response) => {
      if (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
        return resolve(getMockQuote(symbol));
      }
      resolve(data);
    });
  });
};

// Generate mock quote data for testing
const getMockQuote = (symbol) => {
  const basePrice = getBasePriceForSymbol(symbol);
  const randomFactor = 0.98 + Math.random() * 0.04; // Random between 0.98 and 1.02

  return {
    c: Math.round(basePrice * randomFactor * 100) / 100, // Current price
    h: Math.round(basePrice * (randomFactor + 0.01) * 100) / 100, // High price
    l: Math.round(basePrice * (randomFactor - 0.01) * 100) / 100, // Low price
    o: Math.round(basePrice * (randomFactor - 0.005) * 100) / 100, // Open price
    pc: Math.round(basePrice * (randomFactor - 0.02) * 100) / 100, // Previous close price
    t: Math.floor(Date.now() / 1000) // Timestamp
  };
};

// Helper to get base price for a symbol
const getBasePriceForSymbol = (symbol) => {
  // Set realistic base prices for common indices
  switch (symbol.toUpperCase()) {
    case 'AAPL':
      return 150;
    case 'MSFT':
      return 250;
    case 'GOOGL':
      return 2800;
    case 'AMZN':
      return 3500;
    case 'TSLA':
      return 1000;
    case 'NVDA':
      return 200;
    case 'TSM':
      return 100;
    case 'META':
      return 300;
    case 'NFLX':
      return 500;
    case 'GOOG':
      return 2800;
    case 'ORCL':
      return 50;
    default:
      return 1000;
  }
};

module.exports = {
  getStockQuote,
  getApiUsage
}; 