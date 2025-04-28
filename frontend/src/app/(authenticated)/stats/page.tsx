'use client';

import { useEffect, useState } from 'react';
import { getApiUsage, ApiStats } from '@/lib/api';

export default function Stats() {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await getApiUsage();
        setStats(data);
      } catch (err) {
        console.error('Error fetching API stats:', err);
        setError('Failed to load API statistics. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 300000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const calculateQuotaPercentage = (used: number, total: number) => {
    return ((used / total) * 100).toFixed(1);
  };

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">API Statistics - API Used: Finnhub</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor API usage and quota limits
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
        ) : stats ? (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Requests
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {formatNumber(stats.totalRequests)}
                  </dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Requests Today
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {formatNumber(stats.requestsToday)}
                  </dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Remaining Quota
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {formatNumber(stats.remainingQuota)}
                  </dd>
                </div>
              </div>
            </div>

            {/* Quota Usage */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Daily Quota Usage</h3>
                <div className="mt-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                          {calculateQuotaPercentage(stats.requestsToday, stats.planLimit)}% Used
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-indigo-600">
                          {formatNumber(stats.requestsToday)} / {formatNumber(stats.planLimit)}
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                      <div
                        style={{ width: `${calculateQuotaPercentage(stats.requestsToday, stats.planLimit)}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
} 