import React from 'react';
import { Check } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { loadStripe } from '@stripe/stripe-js';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTierProps {
  name: string;
  price: number;
  features: PricingFeature[];
  stripePriceId: string;
  popular?: boolean;
}

const stripePromise = loadStripe('your_publishable_key');

const PricingCard: React.FC<PricingTierProps> = ({ name, price, features, stripePriceId, popular }) => {
  const { isSignedIn } = useUser();

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      // Redirect to sign in
      window.location.href = '/sign-in';
      return;
    }

    const stripe = await stripePromise;
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId: stripePriceId }),
    });

    const session = await response.json();
    await stripe?.redirectToCheckout({ sessionId: session.id });
  };

  return (
    <div className={`relative p-8 bg-white border rounded-2xl shadow-sm ${popular ? 'border-indigo-600 shadow-lg' : 'border-gray-200'}`}>
      {popular && (
        <span className="absolute top-0 -translate-y-1/2 bg-indigo-600 text-white px-3 py-0.5 text-sm font-semibold tracking-wide rounded-full">
          Popular
        </span>
      )}
      <div className="text-center">
        <h3 className="text-lg font-semibold leading-8 text-gray-900">{name}</h3>
        <p className="mt-4">
          <span className="text-4xl font-bold tracking-tight text-gray-900">${price}</span>
          <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
        </p>
        <button
          onClick={handleSubscribe}
          className={`mt-8 w-full py-2.5 px-3.5 rounded-md text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            popular
              ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          Get started
        </button>
      </div>
      <ul role="list" className="mt-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex gap-x-3">
            <Check className={`h-6 w-5 flex-none ${feature.included ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className={`text-sm leading-6 ${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingCard;