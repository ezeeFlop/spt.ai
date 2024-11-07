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
  Legend,
  Filler
} from 'chart.js';
import { statsApi } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimeRange = 'week' | 'month' | 'year';

interface RevenueData {
  [currency: string]: {
    labels: string[];
    data: number[];
  };
}

const DashboardStats: React.FC = () => {
  const intl = useIntl();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [userStats, setUserStats] = useState<any>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueData>({});
  const [totalRevenue, setTotalRevenue] = useState<{ 
    total: number; 
    by_currency: { [key: string]: number } 
  }>({
    total: 0,
    by_currency: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [usersResponse, revenueResponse, totalResponse] = await Promise.all([
          statsApi.getUserStats(timeRange),
          statsApi.getRevenueStats(timeRange),
          statsApi.getTotalRevenue()
        ]);
        console.log("usersResponse.data", usersResponse.data);
        console.log("revenueResponse.data", revenueResponse.data);
        console.log("totalResponse.data", totalResponse.data);

        setUserStats(usersResponse.data);
        setRevenueStats(revenueResponse.data || {});
        setTotalRevenue(totalResponse.data || { total: 0, by_currency: {} });
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        setError(
          error.response?.status === 403
            ? intl.formatMessage({ id: 'error.unauthorized' })
            : intl.formatMessage({ id: 'error.stats.fetch' })
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [timeRange, intl]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            weight: '500'
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        padding: 12,
        borderColor: 'rgba(229, 231, 235, 1)',
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        },
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return ` ${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 1)',
          drawBorder: false
        },
        ticks: {
          padding: 8,
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          padding: 8,
          font: {
            size: 11
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.3,
        borderWidth: 2
      },
      point: {
        radius: 3,
        hoverRadius: 5,
        hitRadius: 30
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {intl.formatMessage({ id: 'stats.title' })}
        </h1>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              timeRange === range
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {intl.formatMessage({ id: `stats.${range}ly` })}
          </button>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {Object.entries(totalRevenue.by_currency).map(([currency, amount]) => (
          <div
            key={currency}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-600">
                {intl.formatMessage({ id: 'stats.totalRevenue' })} ({currency})
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(amount as number, currency)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {intl.formatMessage({ id: 'stats.userGrowth' })}
          </h3>
          <div className="h-[300px]">
            <Line
              data={{
                labels: userStats?.labels || [],
                datasets: [
                  {
                    label: intl.formatMessage({ id: 'stats.newUsers' }),
                    data: userStats?.data || [],
                    borderColor: 'rgb(79, 70, 229)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Revenue Charts */}
        {Object.entries(revenueStats).map(([currency, data]) => (
          <div
            key={currency}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {intl.formatMessage({ id: 'stats.revenueGrowth' })} ({currency})
            </h3>
            <div className="h-[300px]">
              <Line
                data={{
                  labels: data.labels,
                  datasets: [
                    {
                      label: intl.formatMessage({ id: 'stats.revenue' }),
                      data: data.data,
                      borderColor: 'rgb(16, 185, 129)',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      fill: true
                    }
                  ]
                }}
                options={chartOptions}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
