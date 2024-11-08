import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { statsApi } from '../services/api';

interface RevenueByCurrency {
  [currency: string]: {
    labels: string[];
    data: number[];
  };
}

export const RevenueStats = () => {
  const [revenueData, setRevenueData] = useState<RevenueByCurrency>({});
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        const data = await statsApi.getRevenueStats(selectedTimeRange);
        setRevenueData(data);
      } catch (error) {
        console.error('Error fetching revenue stats:', error);
      }
    };

    fetchRevenueStats();
  }, [selectedTimeRange]);

  const chartData = {
    labels: revenueData[selectedCurrency]?.labels || [],
    datasets: [
      {
        label: `Revenue (${selectedCurrency})`,
        data: revenueData[selectedCurrency]?.data || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value as 'week' | 'month' | 'year')}
          className="mr-2"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>

        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="ml-2"
        >
          {Object.keys(revenueData).map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>

      {revenueData[selectedCurrency] ? (
        <Line data={chartData} />
      ) : (
        <p>No revenue data available for {selectedCurrency}</p>
      )}
    </div>
  );
};
