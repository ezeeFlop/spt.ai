import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { userApi, tierApi, subscriptionApi, paymentApi } from '../../services/api';
import { User, UserUpdate } from '../../types/user';
import { Tier } from '../../types/tier';
import { toast } from 'react-hot-toast';

const ListUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const intl = useIntl();

  useEffect(() => {
    fetchUsers();
    fetchTiers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAll();
      console.log(response.data);
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchTiers = async () => {
    try {
      const response = await tierApi.getAll();
      setTiers(response.data);
    } catch (error) {
      toast.error('Failed to fetch tiers');
    }
  };

  const handleUpdateUser = async (userId: number, update: UserUpdate) => {
    try {
      await userApi.update(userId.toString(), update);
      toast.success('User updated successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleTierChange = async (userId: number, tierId: number) => {
    try {
      const selectedTier = tiers.find(t => t.id === tierId);
      if (!selectedTier) {
        throw new Error('Invalid tier selected');
      }

      if (selectedTier.is_free) {
        await subscriptionApi.registerFreeTier();
      } else {
        const { url } = await paymentApi.createCheckoutSession(tierId);
        window.location.href = url;
        return; // Exit early as we're redirecting
      }

      await fetchUsers(); // Refresh the list to get updated tier info
      toast.success(intl.formatMessage({ id: 'admin.users.success.update' }));
    } catch (error) {
      console.error('Error updating tier:', error);
      toast.error(intl.formatMessage({ id: 'admin.users.error.update' }));
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            {intl.formatMessage({ id: 'admin.users.title' })}
          </h1>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {intl.formatMessage({ id: 'admin.users.name' })}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {intl.formatMessage({ id: 'admin.users.email' })}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {intl.formatMessage({ id: 'admin.users.tier' })}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {intl.formatMessage({ id: 'admin.users.apiCalls' })}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.tier?.id || ''}
                          onChange={(e) => handleTierChange(user.id, parseInt(e.target.value))}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="">No tier</option>
                          {tiers.map((tier) => (
                            <option key={tier.id} value={tier.id}>
                              {tier.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={user.api_calls_count}
                            onChange={(e) => handleUpdateUser(user.id, { api_calls_count: Number(e.target.value) })}
                            className="mt-1 block w-24 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          />
                          <span className="mx-2">/</span>
                          <input
                            type="number"
                            value={user.api_max_calls}
                            onChange={(e) => handleUpdateUser(user.id, { api_max_calls: Number(e.target.value) })}
                            className="mt-1 block w-24 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListUsers; 