import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import PricingCard from '../components/PricingCard';
import { tierApi } from '../services/api';
import { Tier } from '../types/tier';

const Pricing = () => {
  const intl = useIntl();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const response = await tierApi.getAll();
        setTiers(response.data);
      } catch (err) {
        console.error('Error fetching tiers:', err);
        setError(intl.formatMessage({ id: 'error.tiers.fetch' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTiers();
  }, [intl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

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
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tierId={tier.id}
              name={tier.name}
              price={tier.price}
              stripePriceId={tier.stripe_price_id}
              popular={tier.popular}
              tokens={tier.tokens}
              billing_period={tier.billing_period}
              currency={tier.currency}
              type={tier.type}
              features={tier.products.map(product => ({
                textId: product.name,
                values: {
                  type: product.description
                },
                included: true
              }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;