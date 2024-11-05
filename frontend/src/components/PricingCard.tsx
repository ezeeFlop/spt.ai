import React from 'react';
import { useIntl } from 'react-intl';
import { Check } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { loadStripe } from '@stripe/stripe-js';
import { paymentApi } from '../services/api';
import { toast } from 'react-toastify';

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
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PricingCard: React.FC<PricingTierProps> = ({ tierId, name, price, features, stripePriceId, popular }) => {
  const { isSignedIn } = useUser();
  const intl = useIntl();

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      window.location.href = tierId === 'free' ? '/sign-up' : '/sign-in';
      return;
    }

    try {
      if (tierId === 'free') {
        const subscription = await paymentApi.registerFreeTier();
        window.location.href = '/dashboard';
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { checkout_session_id, url } = await paymentApi.createCheckoutSession(
        parseInt(tierId)
      );

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      // Show error toast or notification
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
    <div className={`relative p-8 bg-white border rounded-2xl shadow-sm ${popular ? 'border-indigo-600 shadow-lg' : 'border-gray-200'}`}>
      {popular && (
        <span className="absolute top-0 -translate-y-1/2 bg-indigo-600 text-white px-3 py-0.5 text-sm font-semibold tracking-wide rounded-full">
          {intl.formatMessage({ id: 'pricing.popular' })}
        </span>
      )}
      <div className="text-center">
        <h3 className="text-lg font-semibold leading-8 text-gray-900">
          {intl.formatMessage({ id: name })}
        </h3>
        <p className="mt-4">
          <span className="text-4xl font-bold tracking-tight text-gray-900">
            {price === 0 ? '' : '$'}{price}
          </span>
          <span className="text-sm font-semibold leading-6 text-gray-600">
            {intl.formatMessage({ id: price === 0 ? 'pricing.period.free' : 'pricing.period.paid' })}
          </span>
        </p>
        <button
          onClick={handleSubscribe}
          className={`mt-8 w-full py-2.5 px-3.5 rounded-md text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            popular
              ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          {intl.formatMessage({ id: price === 0 ? 'pricing.cta.free' : 'pricing.cta.paid' })}
        </button>
      </div>
      <ul role="list" className="mt-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex gap-x-3">
            <Check className={`h-6 w-5 flex-none ${feature.included ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className={`text-sm leading-6 ${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>
              {formatFeatureText(feature)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingCard;