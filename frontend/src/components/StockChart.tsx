'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import AlertModal from './AlertModal';

// Register Chart.js components
Chart.register(...registerables);

interface StockChartProps {
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

export default function StockChart({ data }: StockChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create mock data for the chart (in a real app, you would fetch historical data)
    const labels = Array.from({ length: 24 }, (_, i) => {
      const hour = 23 - i;
      return `${hour}:00`;
    }).reverse();

    // Generate mock price data based on current price and change
    const priceChange = data.change;
    const basePrice = data.currentPrice - priceChange;

    const prices = labels.map((_, i) => {
      // Create a slightly random variation around the trend
      const progress = i / (labels.length - 1);
      const trendValue = basePrice + (priceChange * progress);
      const randomFactor = 0.01; // 1% random variation
      const randomChange = (Math.random() - 0.5) * randomFactor * basePrice;
      return trendValue + randomChange;
    });

    // Chart configuration
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `${data.symbol} Price`,
            data: prices,
            borderColor: data.change >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)', // Green for positive, red for negative
            backgroundColor: data.change >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            tension: 0.1,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `$${value.toFixed(2)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6,
            },
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: (value) => `$${Number(value).toFixed(2)}`,
            },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
      },
    };

    // Create new chart
    chartInstance.current = new Chart(chartRef.current, config);

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  const handleSetAlert = () => {
    setIsAlertModalOpen(true);
  };

  return (
    <>
      <div className="bg-white overflow-hidden shadow rounded-lg h-full">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {data.name || data.symbol}
            </h3>
            <span className="text-sm text-gray-500">{data.displaySymbol || data.symbol}</span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              ${data.currentPrice.toFixed(2)}
            </div>
            <div className={`mt-1 text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.change >= 0 ? '+' : ''}${data.change.toFixed(2)} ({data.change >= 0 ? '+' : ''}{data.percentChange})
            </div>
          </div>

          <div className="mt-6 h-64">
            <canvas ref={chartRef}></canvas>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            {data.openPrice && (
              <div>
                <p className="text-sm font-medium text-gray-500">Open</p>
                <p className="mt-1 text-sm text-gray-900">${data.openPrice?.toFixed(2) || 'N/A'}</p>
              </div>
            )}

            {data.highPrice && (
              <div>
                <p className="text-sm font-medium text-gray-500">High</p>
                <p className="mt-1 text-sm text-gray-900">${data.highPrice?.toFixed(2) || 'N/A'}</p>
              </div>
            )}

            {data.lowPrice && (
              <div>
                <p className="text-sm font-medium text-gray-500">Low</p>
                <p className="mt-1 text-sm text-gray-900">${data.lowPrice?.toFixed(2) || 'N/A'}</p>
              </div>
            )}

            {data.previousClose && (
              <div>
                <p className="text-sm font-medium text-gray-500">Previous Close</p>
                <p className="mt-1 text-sm text-gray-900">${data.previousClose.toFixed(2)}</p>
              </div>
            )}
          </div>

          {data.market && (
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Market: {data.market}
              </p>
            </div>
          )}

          <div className="mt-4">
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