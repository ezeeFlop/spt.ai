import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useIntl } from 'react-intl';
import { userApi } from '../services/api';
import { UserDetails } from '../types/user';
import { useSubscription } from '../context/SubscriptionContext';

export const HeaderTierInfo: React.FC = () => {
  const { isSignedIn } = useUser();
  const intl = useIntl();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [fetchError, setFetchError] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isSignedIn) {
        try {
          setFetchError(false);
          const response = await userApi.getMyDetails();
          console.log('User Details Response:', response);
          setUserDetails(response.data);
        } catch (error) {
          console.error('Error fetching user details:', error);
          setFetchError(true);
        }
      }
    };

    fetchUserDetails();
  }, [isSignedIn, subscription]);

    useEffect(() => {
      console.log('Current Subscription:', subscription);
    }, [subscription]);

  if (!isSignedIn) return null;

  if (subscriptionLoading || (!userDetails && !fetchError)) {
    return (
      <div className="flex flex-col items-end mr-4">
        <div className="animate-pulse h-6 w-20 bg-gray-200 rounded-full" />
      </div>
    );
  }

  // Determine the tier name using both subscription and user details
  const tierName = subscription?.tier?.name || userDetails?.tier?.name;
  // Only show usage info if the values are available
  const hasUsageInfo = typeof userDetails?.api_calls_count === 'number' && 
                      typeof userDetails?.api_max_calls === 'number';
  return (
    <div className="flex flex-col items-end mr-4">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        {tierName || intl.formatMessage({ id: 'tier.none' })}
      </span>
      {hasUsageInfo && (
        <span className="text-xs text-gray-500">
          {intl.formatMessage(
            { id: 'tier.tokensRemaining' },
            { 
              remaining: (userDetails?.api_max_calls || 0) - (userDetails?.api_calls_count || 0),
              total: userDetails?.api_max_calls || 0
            }
          )}
        </span>
      )}
    </div>
  );
};
