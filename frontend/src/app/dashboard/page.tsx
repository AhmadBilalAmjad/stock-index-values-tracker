'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { getStockIndices } from '@/lib/api';
import { StockQuote } from '@/lib/api';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stockData, setStockData] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

    if (user) {
      fetchStockData();

      // Set up polling to refresh data every 60 seconds
      const interval = setInterval(fetchStockData, 60000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Stock Indices Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track the performance of major stock indices in real-time
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                      {stock.name}
                    </h3>
                    <span className="text-sm text-gray-500">{stock.displaySymbol}</span>
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

                  <div className="mt-4">
                    <p className="text-xs text-gray-500">
                      Market: {stock.market}
                    </p>
                  </div>
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
    </div>
  );
} 