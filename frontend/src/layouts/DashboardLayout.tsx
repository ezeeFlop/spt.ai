import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import LayersIcon from '@mui/icons-material/Layers';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import { FormattedMessage } from 'react-intl';
import { FileText } from 'lucide-react';
import { TierBadge } from '../components/TierBadge';
import { useSubscription } from '../context/SubscriptionContext';

const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard bg-gray-50 min-h-screen flex">
      <aside className="dashboard-menu bg-white shadow-lg p-6 w-64 hidden md:block">
        <ul className="space-y-4">
          <li>
            <Link
              to="/dashboard/users"
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <PeopleIcon className="mr-2" />
              <span>
                <FormattedMessage id="dashboard.menu.users" />
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/tiers"
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <LayersIcon className="mr-2" />
              <span>
                <FormattedMessage id="dashboard.menu.tiers" />
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/products"
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <ShoppingCartIcon className="mr-2" />
              <span>
                <FormattedMessage id="dashboard.menu.products" />
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/statistics"
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <BarChartIcon className="mr-2" />
              <span>
                <FormattedMessage id="dashboard.menu.statistics" />
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/blog"
              className="flex items-center text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              <FileText className="mr-2 h-5 w-5" />
              <span>
                <FormattedMessage id="dashboard.menu.blog" />
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/media"
              className="flex items-center text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              <PermMediaIcon className="mr-2" />
              <span>
                <FormattedMessage id="dashboard.menu.media" />
              </span>
            </Link>
          </li>
        </ul>
      </aside>
      <div className="flex-1">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-lg font-semibold text-gray-900">
                <FormattedMessage id="dashboard.title" />
              </h1>
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout; 