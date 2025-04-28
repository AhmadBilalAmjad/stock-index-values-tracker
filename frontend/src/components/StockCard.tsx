'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AlertModal from './AlertModal';

interface StockCardProps {
  data: {
    symbol: string;
    currentPrice: number;
    previousClose: number;
    change: number;
    percentChange: string;
    name?: string;
    displaySymbol?: string;
    market?: string;
    highPrice?: number;
    lowPrice?: number;
    openPrice?: number;
  };
}

export default function StockCard({ data }: StockCardProps) {
  const router = useRouter();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleSetAlert = () => {
    setIsAlertModalOpen(true);
  };

  return (
    <>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {data.name || data.symbol}
            </h3>
            <span className="text-sm text-gray-500">{data.displaySymbol || data.symbol}</span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(data.currentPrice)}
            </div>
            <div className={`mt-1 text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.change >= 0 ? '+' : ''}{formatPrice(data.change)} ({data.change >= 0 ? '+' : ''}{data.percentChange})
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Previous Close</p>
            <p className="mt-1 text-sm text-gray-900">{formatPrice(data.previousClose)}</p>
          </div>

          {data.market && (
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Market: {data.market}
              </p>
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <button
              type="button"
              className="font-medium text-indigo-600 hover:text-indigo-500"
              onClick={handleSetAlert}
            >
              Set Alert
            </button>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        symbol={data.symbol}
        currentPrice={data.currentPrice}
      />
    </>
  );
} 