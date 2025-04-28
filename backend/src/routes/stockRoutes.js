const express = require('express');
const router = express.Router();
const { getStockQuote, getStockCandles, getApiUsage } = require('../utils/finnhub');

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

// Get historical candle data for a specific symbol
router.get('/candles/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { resolution = 'D', from, to } = req.query;

    // Default to last 30 days if not specified
    const endTimestamp = to ? parseInt(to) : Math.floor(Date.now() / 1000);
    const startTimestamp = from ? parseInt(from) : endTimestamp - (30 * 86400); // 30 days back

    const candles = await getStockCandles(symbol, resolution, startTimestamp, endTimestamp);

    if (candles.s === 'no_data') {
      return res.status(404).json({
        success: false,
        error: 'No data found for the specified parameters'
      });
    }

    // Format the data for easier consumption by the frontend
    const formattedData = candles.t.map((timestamp, index) => {
      return {
        timestamp,
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        close: candles.c[index],
        high: candles.h[index],
        low: candles.l[index],
        open: candles.o[index],
        volume: candles.v[index]
      };
    });

    res.json({
      success: true,
      data: {
        symbol,
        resolution,
        from: startTimestamp,
        to: endTimestamp,
        candles: formattedData
      }
    });
  } catch (error) {
    console.error(`Error fetching candles for ${req.params.symbol}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch historical data' });
  }
});

// Get index data for a specific symbol (using candles)
router.get('/indices/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    // Get current quote
    const quote = await getStockQuote(symbol);

    // Get historical data (last 30 days)
    const endTimestamp = Math.floor(Date.now() / 1000);
    const startTimestamp = endTimestamp - (30 * 86400); // 30 days back

    const candles = await getStockCandles(symbol, 'D', startTimestamp, endTimestamp);

    // Format the data for the response
    const historicalData = candles.t.map((timestamp, index) => {
      return {
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        value: candles.c[index],
        volume: candles.v[index]
      };
    });

    // Reverse to get chronological order
    historicalData.reverse();

    res.json({
      success: true,
      data: {
        symbol,
        name: indices.find(index => index.symbol === symbol)?.name || symbol,
        currentPrice: quote.c,
        previousClose: quote.pc,
        change: quote.c - quote.pc,
        percentChange: ((quote.c - quote.pc) / quote.pc * 100).toFixed(2),
        values: historicalData
      }
    });
  } catch (error) {
    console.error(`Error fetching data for ${req.params.symbol}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch index data' });
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