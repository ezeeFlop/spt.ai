import React from 'react';
import PricingCard from '../components/PricingCard';

const pricingTiers = [
  {
    name: 'Starter',
    price: 29,
    stripePriceId: 'price_starter',
    features: [
      { text: '5 AI Applications', included: true },
      { text: 'Basic Analytics', included: true },
      { text: 'Community Support', included: true },
      { text: 'API Access', included: false },
      { text: 'Custom Integrations', included: false },
    ],
  },
  {
    name: 'Professional',
    price: 99,
    stripePriceId: 'price_professional',
    popular: true,
    features: [
      { text: 'Unlimited AI Applications', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Priority Support', included: true },
      { text: 'API Access', included: true },
      { text: 'Custom Integrations', included: false },
    ],
  },
  {
    name: 'Enterprise',
    price: 299,
    stripePriceId: 'price_enterprise',
    features: [
      { text: 'Unlimited AI Applications', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Dedicated Support', included: true },
      { text: 'API Access', included: true },
      { text: 'Custom Integrations', included: true },
    ],
  },
];

const Pricing = () => {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for you
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;