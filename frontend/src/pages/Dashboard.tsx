import React from 'react';
import { useUserRole } from '../hooks/useUserRole';
import { FormattedMessage } from 'react-intl';

const Dashboard = () => {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg font-medium text-gray-600">
          <FormattedMessage id="dashboard.loading" />
        </span>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg font-medium text-red-600">
          <FormattedMessage id="dashboard.accessDenied" />
        </span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        <FormattedMessage id="dashboard.title" />
      </h1>
      {/* Add welcome content or dashboard overview here */}
    </div>
  );
};

export default Dashboard; 