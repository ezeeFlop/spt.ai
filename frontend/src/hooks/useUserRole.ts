import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { authApi } from '../services/api';

export const useUserRole = () => {
  const { user, isSignedIn } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isSignedIn && user?.id) {
        try {
          const response = await authApi.syncUser(user.id);
          setRole(response.user.role);
        } catch (error) {
          console.error('Error fetching user role:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [isSignedIn, user?.id]);

  return { role, isLoading };
};
