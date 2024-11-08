import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { tierApi, productApi } from '../../services/api';
import { Tier } from '../../types/tier';
import { Product } from '../../types/product';
import { formatCurrency } from '../../utils/currency';
import TierModal from '../../components/admin/TierModal';

const ListTiers: React.FC = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | undefined>();
  const intl = useIntl();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiersResponse, productsResponse] = await Promise.all([
          tierApi.getAll(),
          productApi.getAll()
        ]);
        setTiers(tiersResponse.data);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleCreateTier = async (tierData: Partial<Tier>) => {
    try {
      console.log('Creating tier with data:', tierData);
      
      const payload = {
        ...tierData,
        is_free: Boolean(tierData.is_free),
        stripe_price_id: tierData.is_free ? null : tierData.stripe_price_id
      };
      console.log('Payload:', payload.is_free);
      
      const response = await tierApi.create(payload);
      setTiers([...tiers, response.data]);
      setIsModalOpen(false);
      alert(intl.formatMessage({ id: 'admin.tiers.success.create' }));
    } catch (error) {
      console.error('Error creating tier:', error);
      alert(intl.formatMessage({ id: 'admin.tiers.error.create' }));
    }
  };

  const handleUpdateTier = async (tierData: Partial<Tier>) => {
    if (!selectedTier?.id) return;
    
    try {
      console.log('Payload:', tierData.is_free);
      
      await tierApi.update(selectedTier.id.toString(), tierData);
      setTiers(tiers.map(tier => 
        tier.id === selectedTier.id ? { ...tier, ...tierData } : tier
      ));
      setIsModalOpen(false);
      setSelectedTier(undefined);
      alert(intl.formatMessage({ id: 'admin.tiers.success.update' }));
    } catch (error) {
      console.error('Error updating tier:', error);
      alert(intl.formatMessage({ id: 'admin.tiers.error.update' }));
    }
  };

  const handleDeleteTier = async (tierId: number) => {
    if (window.confirm(intl.formatMessage({ id: 'admin.tiers.confirmDelete' }))) {
      try {
        await tierApi.delete(tierId.toString());
        setTiers(tiers.filter(tier => tier.id !== tierId));
        alert(intl.formatMessage({ id: 'admin.tiers.success.delete' }));
      } catch (error) {
        console.error('Error deleting tier:', error);
        alert(intl.formatMessage({ id: 'admin.tiers.error.delete' }));
      }
    }
  };

  const handleEdit = (tier: Tier) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTier(undefined);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {intl.formatMessage({ id: 'admin.tiers.title' })}
        </h1>
        <button
          onClick={() => {
            setSelectedTier(undefined);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          {intl.formatMessage({ id: 'admin.tiers.create' })}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {intl.formatMessage({ id: 'admin.tiers.name' })}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {intl.formatMessage({ id: 'admin.tiers.price' })}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {intl.formatMessage({ id: 'admin.tiers.billingPeriod' })}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {intl.formatMessage({ id: 'admin.tiers.tokens' })}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {intl.formatMessage({ id: 'admin.tiers.products' })}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {intl.formatMessage({ id: 'admin.tiers.actions' })}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tiers.map(tier => (
              <tr key={tier.id}>
                <td className="px-6 py-4 whitespace-nowrap">{tier.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatCurrency(tier.price, tier.currency || 'USD')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{tier.billing_period}</td>
                <td className="px-6 py-4 whitespace-nowrap">{tier.tokens}</td>
                <td className="px-6 py-4">
                  {tier.products?.map(product => product.name).join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleEdit(tier)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTier(tier.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TierModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={selectedTier ? handleUpdateTier : handleCreateTier}
        tier={selectedTier}
        title={intl.formatMessage({
          id: selectedTier ? 'admin.tiers.edit' : 'admin.tiers.create'
        })}
        availableProducts={products}
      />
    </div>
  );
};

export default ListTiers; 