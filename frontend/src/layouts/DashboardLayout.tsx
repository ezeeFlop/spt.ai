import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import LayersIcon from '@mui/icons-material/Layers';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import { FormattedMessage } from 'react-intl';
import { FileText } from 'lucide-react';

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
        </ul>
      </aside>
      <main className="dashboard-content flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout; 