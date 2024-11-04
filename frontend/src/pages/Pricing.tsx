import { useIntl } from 'react-intl';
import PricingCard from '../components/PricingCard';

const pricingTiers = [
  {
    tierId: 'free',
    name: 'pricing.tier.free',
    price: 0,
    stripePriceId: '',
    features: [
      { textId: 'pricing.features.applications', values: { count: 2 }, included: true },
      { textId: 'pricing.features.analytics', values: { type: 'pricing.analytics.basic' }, included: true },
      { textId: 'pricing.features.support', values: { type: 'pricing.support.community' }, included: true },
      { textId: 'pricing.features.rateLimit', values: { count: 1000 }, included: true },
      { textId: 'pricing.features.api', included: false },
      { textId: 'pricing.features.integrations', included: false },
    ],
  },
  {
    tierId: 'starter',
    name: 'pricing.tier.starter',
    price: 29,
    stripePriceId: 'price_starter',
    features: [
      { textId: 'pricing.features.applications', values: { count: 5 }, included: true },
      { textId: 'pricing.features.analytics', values: { type: 'pricing.analytics.basic' }, included: true },
      { textId: 'pricing.features.support', values: { type: 'pricing.support.basic' }, included: true },
      { textId: 'pricing.features.rateLimit', values: { count: 10000 }, included: true },
      { textId: 'pricing.features.api', included: false },
      { textId: 'pricing.features.integrations', included: false },
    ],
  },
  {
    tierId: 'professional',
    name: 'pricing.tier.professional',
    price: 99,
    stripePriceId: 'price_professional',
    popular: true,
    features: [
      { textId: 'pricing.features.applications', values: { count: -1 }, included: true },
      { textId: 'pricing.features.analytics', values: { type: 'pricing.analytics.advanced' }, included: true },
      { textId: 'pricing.features.support', values: { type: 'pricing.support.priority' }, included: true },
      { textId: 'pricing.features.rateLimit', values: { count: 100000 }, included: true },
      { textId: 'pricing.features.api', included: true },
      { textId: 'pricing.features.integrations', included: false },
    ],
  },
  {
    tierId: 'enterprise',
    name: 'pricing.tier.enterprise',
    price: 299,
    stripePriceId: 'price_enterprise',
    features: [
      { textId: 'pricing.features.applications', values: { count: -1 }, included: true },
      { textId: 'pricing.features.analytics', values: { type: 'pricing.analytics.custom' }, included: true },
      { textId: 'pricing.features.support', values: { type: 'pricing.support.dedicated' }, included: true },
      { textId: 'pricing.features.rateLimit', values: { count: -1 }, included: true },
      { textId: 'pricing.features.api', included: true },
      { textId: 'pricing.features.integrations', included: true },
    ],
  },
];

const Pricing = () => {
  const intl = useIntl();

  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            {intl.formatMessage({ id: 'pricing.title' })}
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {intl.formatMessage({ id: 'pricing.subtitle' })}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-4">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.tierId} {...tier} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;