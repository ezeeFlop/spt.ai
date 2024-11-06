import React, { useEffect } from 'react';
import { useUserRole } from '../hooks/useUserRole';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { role, isLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && role === 'admin') {
      navigate('/dashboard/statistics');
    }
  }, [isLoading, role, navigate]);

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

  return null;
};

export default Dashboard; 