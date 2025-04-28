const express = require('express');
const router = express.Router();
const { getStockQuote, getApiUsage } = require('../utils/finnhub');

// Common indices with their finnhub symbols
const indices = [
  { symbol: 'AAPL', displaySymbol: 'AAPL', name: 'Apple', market: 'US' },
  { symbol: 'TSLA', displaySymbol: 'TSLA', name: 'Tesla', market: 'US' },
  { symbol: 'NVDA', displaySymbol: 'NVDA', name: 'NVIDIA', market: 'US' },
  { symbol: 'MSFT', displaySymbol: 'MSFT', name: 'Microsoft', market: 'US' },
  { symbol: 'GOOG', displaySymbol: 'GOOG', name: 'Google', market: 'US' },
  { symbol: 'AMZN', displaySymbol: 'AMZN', name: 'Amazon', market: 'US' }
];

// Get list of stock indices
router.get('/indices', async (req, res) => {
  try {
    // Enhance with real-time quotes if we can
    const enhancedIndices = await Promise.all(indices.map(async (index) => {
      try {
        const quote = await getStockQuote(index.symbol);
        return {
          ...index,
          currentPrice: quote.c,
          previousClose: quote.pc,
          change: quote.c - quote.pc,
          percentChange: ((quote.c - quote.pc) / quote.pc * 100).toFixed(2)
        };
      } catch (error) {
        console.error(`Error fetching quote for ${index.symbol}:`, error);
        return index;
      }
    }));

    res.json({ success: true, data: enhancedIndices });
  } catch (error) {
    console.error('Error fetching indices:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch indices' });
  }
});

// Get current quote for a specific symbol
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await getStockQuote(symbol);

    res.json({
      success: true,
      data: {
        symbol,
        currentPrice: quote.c,
        highPrice: quote.h,
        lowPrice: quote.l,
        openPrice: quote.o,
        previousClose: quote.pc,
        change: quote.c - quote.pc,
        percentChange: ((quote.c - quote.pc) / quote.pc * 100).toFixed(2),
        timestamp: quote.t
      }
    });
  } catch (error) {
    console.error(`Error fetching quote for ${req.params.symbol}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch quote data' });
  }
});

// API usage statistics
router.get('/stats', (req, res) => {
  try {
    const stats = getApiUsage();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching API stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch API statistics' });
  }
});

module.exports = router; 