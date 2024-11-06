import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { UserSubscription } from '../types/subscription';
import { subscriptionApi } from '../services/api';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useUser();

  const refreshSubscription = async () => {
    if (!isSignedIn) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentSubscription = await subscriptionApi.getCurrentSubscription();
      setSubscription(currentSubscription);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subscription');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [isSignedIn]);

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, error, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 