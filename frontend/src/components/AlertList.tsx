import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { getAlerts, deleteAlert } from '@/lib/api';
import { getStockName, formatPrice } from '@/lib/stockUtils';

interface Alert {
  id: string;
  symbol: string;
  threshold: number;
  direction: 'above' | 'below';
  createdAt: string;
}

const AlertList: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDelete = async (alertId: string) => {
    try {
      await deleteAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError('Failed to delete alert. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No alerts set. Create one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center justify-between"
        >
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {alert.symbol} - {getStockName(alert.symbol)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Alert when price goes {alert.direction} {formatPrice(alert.threshold)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Created {new Date(alert.createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={() => handleDelete(alert.id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
            title="Delete alert"
          >
            <FiTrash2 className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertList; 