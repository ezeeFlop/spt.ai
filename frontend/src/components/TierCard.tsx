import React from 'react';
import { Tier } from '../types/tier';
import { useSubscription } from '../contexts/SubscriptionContext';
import { paymentApi, subscriptionApi } from '../services/api';
import { useIntl } from 'react-intl';

interface TierCardProps {
  tier: Tier;
  onSubscribe: () => void;
}

export const TierCard: React.FC<TierCardProps> = ({ tier, onSubscribe }) => {
  const { subscription, refreshSubscription } = useSubscription();
  const intl = useIntl();

  const handleSubscribe = async () => {
    try {
      if (tier.is_free) {
        await subscriptionApi.registerFreeTier();
        await refreshSubscription();
      } else {
        const { url } = await paymentApi.createCheckoutSession(tier.id);
        window.location.href = url;
      }
      onSubscribe();
    } catch (error) {
      console.error('Subscription error:', error);
      alert(intl.formatMessage({ id: 'subscription.error' }));
    }
  };

  const isCurrentTier = subscription?.tier_id === tier.id && subscription.is_active;

  return (
    <div className={`tier-card ${isCurrentTier ? 'current-tier' : ''}`}>
      <h3>{tier.name}</h3>
      <p>{tier.description}</p>
      <div className="price">
        {tier.is_free ? (
          <span>{intl.formatMessage({ id: 'tier.free' })}</span>
        ) : (
          <span>${tier.price}/{tier.billing_period}</span>
        )}
      </div>
      <button 
        onClick={handleSubscribe}
        disabled={isCurrentTier}
        className={isCurrentTier ? 'current' : 'subscribe'}
      >
        {isCurrentTier 
          ? intl.formatMessage({ id: 'tier.current' })
          : intl.formatMessage({ id: 'tier.subscribe' })}
      </button>
    </div>
  );
};
