import React from 'react';
import { useIntl } from 'react-intl';
import { Check, Zap } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { loadStripe } from '@stripe/stripe-js';
import { paymentApi } from '../services/api';
import { toast } from 'react-toastify';
import { useSubscription } from '../context/SubscriptionContext';
import { SignInButton } from '@clerk/clerk-react';

interface PricingFeature {
  textId: string;
  values?: Record<string, string | number>;
  included: boolean;
}

interface PricingTierProps {
  tierId: string;
  name: string;
  price: number;
  features: PricingFeature[];
  stripePriceId: string;
  popular?: boolean;
  tokens: number;
  billing_period: string;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PricingCard: React.FC<PricingTierProps> = ({ 
  tierId, 
  name, 
  price, 
  features, 
  stripePriceId, 
  popular,
  tokens,
  billing_period
}) => {
  const { isSignedIn } = useUser();
  const intl = useIntl();
  const { subscription } = useSubscription();
  
  const isCurrentPlan = subscription?.tier?.id === parseInt(tierId);

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      return;
    }

    try {
      if (subscription?.tier && subscription.tier.id !== parseInt(tierId)) {
        const confirmChange = window.confirm(
          intl.formatMessage({ id: 'pricing.confirmChange' })
        );
        if (!confirmChange) return;
      }

      if (tierId === 'free') {
        const subscription = await paymentApi.registerFreeTier();
        window.location.href = '/dashboard';
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { url } = await paymentApi.createCheckoutSession(parseInt(tierId));
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
    }
  };

  const formatFeatureText = (feature: PricingFeature) => {
    if (feature.values) {
      const translatedValues = Object.entries(feature.values).reduce((acc, [key, value]) => {
        if (typeof value === 'number' && value === -1) {
          return { ...acc, [key]: intl.formatMessage({ id: 'pricing.unlimited' }) };
        }
        if (typeof value === 'string' && value.startsWith('pricing.')) {
          return { ...acc, [key]: intl.formatMessage({ id: value }) };
        }
        return { ...acc, [key]: value };
      }, {});

      return intl.formatMessage({ id: feature.textId }, translatedValues);
    }
    return intl.formatMessage({ id: feature.textId });
  };

  return (
    <div className={`relative flex flex-col h-full p-8 bg-white rounded-3xl transition-all duration-200
      ${popular ? 'scale-105 shadow-xl border-2 border-indigo-600' : 'border border-gray-200 shadow-md hover:shadow-xl'}
      ${isCurrentPlan ? 'ring-2 ring-indigo-600' : ''}`}
    >
      {/* Popular & Current Plan badges */}
      <div className="absolute -top-5 left-0 w-full flex justify-center gap-2">
        {popular && (
          <span className="bg-indigo-600 text-white px-4 py-1 text-sm font-semibold tracking-wide rounded-full shadow-md">
            {intl.formatMessage({ id: 'pricing.popular' })}
          </span>
        )}
        {isCurrentPlan && (
          <span className="bg-green-600 text-white px-4 py-1 text-sm font-semibold tracking-wide rounded-full shadow-md">
            {intl.formatMessage({ id: 'pricing.currentPlan' })}
          </span>
        )}
      </div>

      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {name}
        </h3>
        
        {/* Token Display */}
        <div className="flex items-center justify-center gap-2 mb-4 text-indigo-600">
          <Zap className="w-5 h-5" />
          <span className="font-semibold">
            {tokens === -1 
              ? intl.formatMessage({ id: 'pricing.unlimited' })
              : intl.formatMessage(
                  { id: 'pricing.tokens' },
                  { count: tokens.toLocaleString() }
                )
            }
          </span>
        </div>

        {/* Price Display */}
        <div className="flex items-center justify-center gap-1">
          <span className="text-5xl font-bold tracking-tight text-gray-900">
            {price === 0 ? '' : '$'}{price}
          </span>
          <span className="text-lg text-gray-500 ml-2">
            /{intl.formatMessage({ id: `pricing.period.${billing_period}` })}
          </span>
        </div>
      </div>

      {/* Available Products Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {intl.formatMessage({ id: 'pricing.availableProducts' })}
        </h4>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 flex-shrink-0 text-indigo-600" />
              <span className="text-sm text-gray-600">
                {formatFeatureText(feature)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */
      console.log('isSignedIn', isSignedIn)
      }
      {isSignedIn ? (
        <button
          onClick={handleSubscribe}
          disabled={isCurrentPlan}
          className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200
            ${isCurrentPlan
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : popular
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'
            }`}
        >
          {isCurrentPlan 
            ? intl.formatMessage({ id: 'pricing.currentPlan' })
            : intl.formatMessage({ id: price === 0 ? 'pricing.cta.free' : 'pricing.cta.paid' })}
        </button>
      ) : (
        <SignInButton mode="modal">
          <button
            className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200
              ${popular
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'
              }`}
          >
            {intl.formatMessage({ id: price === 0 ? 'pricing.cta.free' : 'pricing.cta.paid' })}
          </button>
        </SignInButton>
      )}
    </div>
  );
};

export default PricingCard;