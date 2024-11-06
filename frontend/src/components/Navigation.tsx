import { useUserRole } from '../hooks/useUserRole';
import { useIntl } from 'react-intl';
import { HeaderTierInfo } from './HeaderTierInfo';

export const Navigation = () => {
  const { role, isLoading } = useUserRole();
  const intl = useIntl();

  if (isLoading) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and main navigation */}
          <div className="flex">
            {/* Your existing navigation items */}
          </div>

          {/* Right side - Tier info only */}
          <div className="flex items-center">
            <HeaderTierInfo />
          </div>
        </div>
      </div>
    </nav>
  );
}; 