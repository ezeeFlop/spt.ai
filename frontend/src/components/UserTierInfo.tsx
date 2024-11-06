import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { authApi } from '../services/api';
import { useIntl } from 'react-intl';
import { TierBadge } from './TierBadge';

const UserTierInfo: React.FC = () => {
  const { userId } = useAuth();
  const [tier, setTier] = useState<string | null>(null);
  const [counter, setCounter] = useState<number | null>(null);
  const intl = useIntl();

  useEffect(() => {
    const fetchUserTierInfo = async () => {
      if (userId) {
        try {
          const userDetails = await authApi.getUserDetails(userId);
          setTier(userDetails.tier?.name || null);
          setCounter(userDetails.api_calls_count);
        } catch (error) {
          console.error('Error fetching user tier info:', error);
        }
      }
    };

    fetchUserTierInfo();
  }, [userId]);

  return (
    <div className="w-full p-4 mb-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {intl.formatMessage({ id: 'user.account.info' })}
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {intl.formatMessage({ id: 'user.account.tier' })}
          </span>
          <TierBadge 
            tierName={tier}
            tokensLeft={counter}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {intl.formatMessage({ id: 'user.account.apiCalls' })}
          </span>
          <span className="font-medium text-gray-900">
            {counter !== null ? counter : intl.formatMessage({ id: 'loading' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserTierInfo; 