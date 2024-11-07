import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { X } from 'lucide-react';
import { Tier, Product, StripePrice } from '../types';
import { stripeApi } from '../services/api';
import { formatCurrency } from '../utils/currency';

interface TierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tierData: Partial<Tier>) => void;
  tier?: Tier;
  title: string;
  availableProducts: Product[];
}

const TierModal: React.FC<TierModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tier,
  title,
  availableProducts,
}) => {
  const intl = useIntl();
  const [formData, setFormData] = React.useState<Partial<Tier>>(
    tier || {
      name: '',
      description: '',
      price: 0,
      billing_period: 'monthly',
      tokens: 0,
      stripe_price_id: '',
      product_ids: [],
      is_free: false,
      popular: false,
    }
  );
  const [showPopularWarning, setShowPopularWarning] = React.useState(false);
  const [stripePrices, setStripePrices] = useState<StripePrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  React.useEffect(() => {
    if (tier) {
      setFormData({
        ...tier,
        product_ids: tier.products?.map(p => p.id) || [],
      });
    }
  }, [tier]);

  useEffect(() => {
    const fetchStripePrices = async () => {
      if (formData.is_free) return;
      setIsLoadingPrices(true);
      try {
        const prices = await stripeApi.getAllPrices();
        setStripePrices(prices);
      } catch (error) {
        console.error('Error fetching Stripe prices:', error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchStripePrices();
  }, [formData.is_free]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the payload with explicit is_free field
    const payload = {
      ...formData,
      is_free: Boolean(formData.is_free), // Ensure it's a boolean
      price: formData.is_free ? 0 : formData.price,
      billing_period: formData.is_free ? 'free' : formData.billing_period,
      stripe_price_id: formData.is_free ? null : formData.stripe_price_id,
    };
    
    onSubmit(payload);
  };

  const handleIsFreeChange = (checked: boolean) => {
    setFormData({
      ...formData,
      is_free: checked,
      price: 0,
      billing_period: checked ? 'free' : 'monthly',
      stripe_price_id: checked ? '' : formData.stripe_price_id,
    });
  };

  const handlePopularChange = (checked: boolean) => {
    if (checked) {
      setShowPopularWarning(true);
    }
    setFormData({ ...formData, popular: checked });
  };

  const handleStripePriceIdChange = async (priceId: string) => {
    setFormData(prev => ({ ...prev, stripe_price_id: priceId }));
    
    if (!priceId || formData.is_free) return;

    try {
      const priceDetails = await stripeApi.getPriceDetails(priceId);
      setFormData(prev => ({
        ...prev,
        price: priceDetails.amount,
        billing_period: priceDetails.type === 'one_time' ? 'one_time' : (priceDetails.billing_period || prev.billing_period),
        type: priceDetails.type,
        currency: priceDetails.currency,
        name: prev.name || priceDetails.product_name || '',
        description: prev.description || priceDetails.product_description || '',
      }));
    } catch (error) {
      console.error('Error fetching Stripe price details:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {intl.formatMessage({ id: 'admin.tiers.name' })}
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {intl.formatMessage({ id: 'admin.tiers.description' })}
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
              rows={3}
            />
          </div>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={formData.is_free}
                onChange={(e) => handleIsFreeChange(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                {intl.formatMessage({ id: 'admin.tiers.isFree' })}
              </span>
            </label>

            <label className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={formData.popular || false}
                onChange={(e) => handlePopularChange(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                {intl.formatMessage({ id: 'admin.tiers.popular' })}
              </span>
            </label>
          </div>

          {showPopularWarning && formData.popular && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
              {intl.formatMessage({ id: 'admin.tiers.popularWarning' })}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {intl.formatMessage({ id: 'admin.tiers.price' })}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price || 0}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
              required
              disabled={formData.is_free}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {intl.formatMessage({ id: 'admin.tiers.billingPeriod' })}
            </label>
            <select
              value={formData.billing_period || 'monthly'}
              onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
              required
              disabled={formData.is_free}
            >
              {formData.is_free ? (
                <option value="free">Free</option>
              ) : formData.type === 'one_time' ? (
                <option value="one_time">One Time</option>
              ) : (
                <>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {intl.formatMessage({ id: 'admin.tiers.tokens' })}
            </label>
            <input
              type="number"
              min="0"
              value={formData.tokens || ''}
              onChange={(e) => setFormData({ ...formData, tokens: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {intl.formatMessage({ id: 'admin.tiers.stripePriceId' })}
            </label>
            <select
              value={formData.stripe_price_id || ''}
              onChange={(e) => handleStripePriceIdChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
              required={!formData.is_free}
              disabled={formData.is_free || isLoadingPrices}
            >
              <option value="">Select a price</option>
              {stripePrices.map((price) => (
                <option key={price.id} value={price.id}>
                  {price.product_name} - {formatCurrency(price.amount, price.currency)} / {price.billing_period || 'one time'}
                </option>
              ))}
            </select>
            {isLoadingPrices && (
              <div className="mt-1 text-sm text-gray-500">
                Loading prices...
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {intl.formatMessage({ id: 'admin.tiers.products' })}
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
              {availableProducts.map((product) => (
                <label key={product.id} className="flex items-center space-x-2 p-1">
                  <input
                    type="checkbox"
                    checked={(formData.product_ids || []).includes(product.id)}
                    onChange={(e) => {
                      const newProductIds = e.target.checked
                        ? [...(formData.product_ids || []), product.id]
                        : (formData.product_ids || []).filter(id => id !== product.id);
                      setFormData({ ...formData, product_ids: newProductIds });
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>{product.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700"
          >
            {intl.formatMessage({ id: tier ? 'admin.tiers.edit' : 'admin.tiers.create' })}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TierModal;
