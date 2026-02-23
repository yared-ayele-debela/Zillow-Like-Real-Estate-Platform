import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const PriceHistoryChart = ({ priceHistory = [] }) => {
  const chartData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) {
      return [];
    }

    return priceHistory.map((entry) => ({
      date: new Date(entry.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      price: parseFloat(entry.price),
      change: entry.change || 0,
      changePercent: entry.change_percent || 0,
    }));
  }, [priceHistory]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Price History</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>No price history available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{data.date}</p>
          <p className="text-indigo-600">
            Price: ${data.price.toLocaleString()}
          </p>
          {data.change !== 0 && (
            <p className={data.change > 0 ? 'text-green-600' : 'text-red-600'}>
              Change: {data.change > 0 ? '+' : ''}
              {data.change.toLocaleString()} ({data.changePercent > 0 ? '+' : ''}
              {data.changePercent}%)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const minPrice = Math.min(...chartData.map((d) => d.price));
  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const priceRange = maxPrice - minPrice;
  const yAxisDomain = [
    Math.max(0, minPrice - priceRange * 0.1),
    maxPrice + priceRange * 0.1,
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Price History</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              domain={yAxisDomain}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ fill: '#4f46e5', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {chartData.length > 1 && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">First Listed: </span>
              <span className="font-semibold">
                ${chartData[0].price.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Current Price: </span>
              <span className="font-semibold text-indigo-600">
                ${chartData[chartData.length - 1].price.toLocaleString()}
              </span>
            </div>
            {chartData.length > 1 && (
              <div className="col-span-2">
                <span className="text-gray-600">Total Change: </span>
                <span
                  className={`font-semibold ${
                    chartData[chartData.length - 1].price >= chartData[0].price
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {chartData[chartData.length - 1].price >= chartData[0].price ? '+' : ''}
                  {(
                    chartData[chartData.length - 1].price - chartData[0].price
                  ).toLocaleString()}{' '}
                  (
                  {(
                    ((chartData[chartData.length - 1].price - chartData[0].price) /
                      chartData[0].price) *
                    100
                  ).toFixed(2)}
                  %)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceHistoryChart;
