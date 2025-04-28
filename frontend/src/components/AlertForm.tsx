import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createAlert } from '@/lib/api';
import { COMMON_STOCKS } from '@/lib/stockUtils';

interface AlertFormProps {
  onSuccess: () => void;
}

interface AlertFormData {
  symbol: string;
  threshold: number;
  direction: 'above' | 'below';
}

const AlertForm: React.FC<AlertFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AlertFormData>({
    defaultValues: {
      symbol: 'AAPL',
      threshold: 0,
      direction: 'above'
    }
  });

  const onSubmit = async (data: AlertFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createAlert(data.symbol, data.threshold, data.direction);
      reset();
      onSuccess();
    } catch (err) {
      console.error('Error creating alert:', err);
      setError('Failed to create alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create Price Alert</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stock Symbol
          </label>
          <select
            id="symbol"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            {...register('symbol', { required: 'Symbol is required' })}
          >
            {COMMON_STOCKS.map(stock => (
              <option key={stock.symbol} value={stock.symbol}>
                {stock.symbol} - {stock.name}
              </option>
            ))}
          </select>
          {errors.symbol && (
            <p className="mt-1 text-sm text-red-600">{errors.symbol.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price Threshold
          </label>
          <input
            type="number"
            id="threshold"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            {...register('threshold', {
              required: 'Threshold is required',
              min: { value: 0, message: 'Threshold must be positive' }
            })}
          />
          {errors.threshold && (
            <p className="mt-1 text-sm text-red-600">{errors.threshold.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alert Direction
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="above"
                className="form-radio h-4 w-4 text-blue-600"
                {...register('direction')}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Above</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="below"
                className="form-radio h-4 w-4 text-blue-600"
                {...register('direction')}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Below</span>
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Alert'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlertForm; 