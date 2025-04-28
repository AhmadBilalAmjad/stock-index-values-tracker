import React from 'react';
import Link from 'next/link';
import { formatPrice, formatPercentage, getPriceChangeColor, getPriceChangeIcon } from '@/lib/stockUtils';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const StockCard: React.FC<StockCardProps> = ({ symbol, name, price, change, changePercent }) => {
  const changeColor = getPriceChangeColor(change);
  const changeIcon = getPriceChangeIcon(change);

  return (
    <Link href={`/stocks/${symbol}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{symbol}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{name}</p>
          </div>
          <div className={`text-lg font-bold ${changeColor}`}>
            {formatPrice(price)}
          </div>
        </div>
        <div className="mt-2 flex items-center">
          <span className={`text-sm font-medium ${changeColor}`}>
            {changeIcon} {formatPrice(Math.abs(change))} ({formatPercentage(changePercent)})
          </span>
        </div>
      </div>
    </Link>
  );
};

export default StockCard; 