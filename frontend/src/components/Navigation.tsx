import { useUserRole } from '../hooks/useUserRole';
import { useIntl } from 'react-intl';

export const Navigation = () => {
  const { role, isLoading } = useUserRole();
  const intl = useIntl();

  if (isLoading) {
    return null; // Or show a loading spinner
  }

  return (
    <nav className="bg-white shadow-md p-4">
      <ul className="flex space-x-4">
        {/* ... other links ... */}
        
      </ul>
    </nav>
  );
}; 