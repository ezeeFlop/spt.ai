import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { statsApi } from '../../services/api';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TimeRange = 'week' | 'month' | 'year';

const DashboardStats: React.FC = () => {
  const intl = useIntl();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [userStats, setUserStats] = useState<any>(null);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [usersResponse, revenueResponse, totalResponse] = await Promise.all([
          statsApi.getUserStats(timeRange),
          statsApi.getRevenueStats(timeRange),
          statsApi.getTotalRevenue()
        ]);

        setUserStats(usersResponse.data);
        setRevenueStats(revenueResponse.data);
        setTotalRevenue(totalResponse.data.total);
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        if (error.response?.status === 403) {
          toast.error(intl.formatMessage({ id: 'error.unauthorized' }));
        } else {
          toast.error(intl.formatMessage({ id: 'error.stats.fetch' }));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const userChartData = {
    labels: userStats?.labels || [],
    datasets: [
      {
        label: intl.formatMessage({ id: 'stats.newUsers' }),
        data: userStats?.data || [],
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1
      }
    ]
  };

  const revenueChartData = {
    labels: revenueStats?.labels || [],
    datasets: [
      {
        label: intl.formatMessage({ id: 'stats.revenue' }),
        data: revenueStats?.data || [],
        borderColor: 'rgb(16, 185, 129)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {intl.formatMessage({ id: 'stats.title' })}
        </h1>
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="week">{intl.formatMessage({ id: 'stats.weekly' })}</option>
            <option value="month">{intl.formatMessage({ id: 'stats.monthly' })}</option>
            <option value="year">{intl.formatMessage({ id: 'stats.yearly' })}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {intl.formatMessage({ id: 'stats.totalRevenue' })}
        </h2>
        <p className="text-3xl font-bold text-green-600">
          ${totalRevenue.toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {intl.formatMessage({ id: 'stats.userGrowth' })}
          </h2>
          <Line data={userChartData} />
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {intl.formatMessage({ id: 'stats.revenueGrowth' })}
          </h2>
          <Line data={revenueChartData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
