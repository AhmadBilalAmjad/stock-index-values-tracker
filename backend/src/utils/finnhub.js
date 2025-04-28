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

// Get stock candles (historical data) for a symbol
const getStockCandles = (symbol, resolution, from, to) => {
  return new Promise((resolve, reject) => {
    if (!finnhubClient) {
      // Return mock data if no API key
      return resolve(getMockCandles(symbol, from, to));
    }

    incrementUsage();
    finnhubClient.stockCandles(symbol, resolution, from, to, (error, data, response) => {
      if (error) {
        console.error(`Error fetching candles for ${symbol}:`, error);
        return resolve(getMockCandles(symbol, from, to));
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

// Generate mock candles data for testing
const getMockCandles = (symbol, from, to) => {
  const basePrice = getBasePriceForSymbol(symbol);
  const timestamps = [];
  const candles = { c: [], h: [], l: [], o: [], v: [], t: [], s: 'ok' };

  // Generate data points at daily intervals
  let current = from;
  while (current <= to) {
    timestamps.push(current);
    current += 86400; // Add a day in seconds
  }

  // Generate price data for each timestamp
  let currentPrice = basePrice;
  timestamps.forEach(timestamp => {
    // Random walk with slight upward bias
    const priceDelta = (Math.random() - 0.48) * basePrice * 0.02;
    currentPrice += priceDelta;

    candles.t.push(timestamp);
    candles.c.push(Math.round(currentPrice * 100) / 100); // Close
    candles.h.push(Math.round((currentPrice + Math.random() * basePrice * 0.01) * 100) / 100); // High
    candles.l.push(Math.round((currentPrice - Math.random() * basePrice * 0.01) * 100) / 100); // Low
    candles.o.push(Math.round((currentPrice - priceDelta * 0.5) * 100) / 100); // Open
    candles.v.push(Math.floor(Math.random() * 10000000) + 1000000); // Volume
  });

  return candles;
};

// Helper to get base price for a symbol
const getBasePriceForSymbol = (symbol) => {
  // Set realistic base prices for common indices
  switch (symbol.toUpperCase()) {
    case 'SPX':
    case '^GSPC':
      return 4500;
    case 'IXIC':
    case '^IXIC':
      return 14000;
    case 'DJI':
    case '^DJI':
      return 35000;
    case 'FTSE':
    case '^FTSE':
      return 7500;
    case 'DAX':
    case '^GDAXI':
      return 15000;
    case 'N225':
    case '^N225':
      return 30000;
    default:
      return 1000;
  }
};

module.exports = {
  getStockQuote,
  getStockCandles,
  getApiUsage
}; 