// Common stock symbols
export const COMMON_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' }
];

// Format price with 2 decimal places
export const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

// Format percentage with 2 decimal places
export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get color based on price change
export const getPriceChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-500';
  if (change < 0) return 'text-red-500';
  return 'text-gray-500';
};

// Get icon based on price change
export const getPriceChangeIcon = (change: number): string => {
  if (change > 0) return '↑';
  if (change < 0) return '↓';
  return '−';
};

// Get stock name from symbol
export const getStockName = (symbol: string): string => {
  const stock = COMMON_STOCKS.find(s => s.symbol === symbol);
  return stock ? stock.name : symbol;
}; 