'use client';

import { useEffect, useState } from 'react';
import { getStockIndices, getStockQuote, StockQuote } from '@/lib/api';
import StockChart from '@/components/StockChart';
import StockCard from '@/components/StockCard';

export default function Dashboard() {
  const [stockData, setStockData] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchResult, setSearchResult] = useState<StockQuote | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'chart'>('chart');

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await getStockIndices();
        setStockData(data);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();

    // Set up polling to refresh data every 60 seconds
    const interval = setInterval(fetchStockData, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchSymbol.trim()) {
      setSearchError('Please enter a stock symbol');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const result = await getStockQuote(searchSymbol.toUpperCase());
      setSearchResult(result);
    } catch (err) {
      console.error('Error searching for stock:', err);
      setSearchError('Failed to find stock. Please check the symbol and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Stock Indices Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track the performance of major stock indices in real-time
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search Form */}
        <div className="mb-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Search for a Stock</h2>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="search-symbol" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Symbol
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="search-symbol"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="e.g., AAPL, MSFT, GOOGL"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="sm:flex-shrink-0 sm:self-end">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </form>
            {searchError && (
              <p className="mt-2 text-sm text-red-600">{searchError}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="mb-4 flex justify-end">
          <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="View mode toggle">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${viewMode === 'card'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              onClick={() => setViewMode('card')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${viewMode === 'chart'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              onClick={() => setViewMode('chart')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="mb-8">
            {viewMode === 'card' ? (
              <StockCard data={searchResult} />
            ) : (
              <StockChart data={searchResult} />
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stockData.map((stock) => (
              <StockCard key={stock.symbol} data={stock} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stockData.map((stock) => (
              <StockChart key={stock.symbol} data={stock} />
            ))}
          </div>
        )}
      </main>
    </>
  );
} 