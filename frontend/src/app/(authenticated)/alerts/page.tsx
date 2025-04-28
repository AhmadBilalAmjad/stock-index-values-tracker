'use client';

import { useEffect, useState } from 'react';
import { getAlerts, deleteAlert, Alert } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) {
          setError('You need to be logged in to view alerts');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        const userAlerts = await getAlerts(user?.uid);
        setAlerts(userAlerts);
      } catch (err: any) {
        console.error('Error fetching alerts:', err);

        if (err.message && err.message.includes('Authentication required')) {
          setError('You need to be logged in to view alerts. Redirecting to login...');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        setError('Failed to load alerts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [router]);

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await deleteAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError('Failed to delete alert. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Price Alerts</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-md shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No alerts set</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't set any price alerts yet.</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Set an Alert
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <li key={alert.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <p className="text-lg font-semibold text-gray-900 truncate">
                        {alert.symbol}
                      </p>
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${alert.direction === 'above'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {alert.direction === 'above' ? 'Above' : 'Below'} ${alert.threshold.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Created on {formatDate(alert.createdAt)}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Delete alert"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 