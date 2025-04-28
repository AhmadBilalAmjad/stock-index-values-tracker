'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStockIndices, getStockQuote, StockQuote } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [stockData, setStockData] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchResult, setSearchResult] = useState<StockQuote | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
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
                <input
                  type="text"
                  id="search-symbol"
                  placeholder="e.g., AAPL, MSFT, GOOGL"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  value={searchSymbol}
                  onChange={(e) => setSearchSymbol(e.target.value)}
                />
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

        {/* Search Result */}
        {searchResult && (
          <div className="mb-8 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {searchResult.symbol}
                </h3>
              </div>

              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(searchResult.currentPrice)}
                </div>
                <div className={`mt-1 text-sm ${searchResult.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {searchResult.change >= 0 ? '+' : ''}{formatPrice(searchResult.change)} ({searchResult.change >= 0 ? '+' : ''}{searchResult.percentChange}%)
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Open</p>
                  <p className="mt-1 text-sm text-gray-900">{formatPrice(searchResult.openPrice || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">High</p>
                  <p className="mt-1 text-sm text-gray-900">{formatPrice(searchResult.highPrice || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Low</p>
                  <p className="mt-1 text-sm text-gray-900">{formatPrice(searchResult.lowPrice || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Previous Close</p>
                  <p className="mt-1 text-sm text-gray-900">{formatPrice(searchResult.previousClose)}</p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => router.push(`/alerts?symbol=${searchResult.symbol}`)}
                >
                  Set Alert
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stockData.map((stock) => (
              <div
                key={stock.symbol}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {stock.name || stock.symbol}
                    </h3>
                    <span className="text-sm text-gray-500">{stock.displaySymbol || stock.symbol}</span>
                  </div>

                  <div className="mt-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(stock.currentPrice)}
                    </div>
                    <div className={`mt-1 text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)} ({stock.change >= 0 ? '+' : ''}{stock.percentChange}%)
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Previous Close</p>
                    <p className="mt-1 text-sm text-gray-900">{formatPrice(stock.previousClose)}</p>
                  </div>

                  {stock.market && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">
                        Market: {stock.market}
                      </p>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <button
                      type="button"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                      onClick={() => router.push(`/alerts?symbol=${stock.symbol}`)}
                    >
                      Set Alert
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
} 