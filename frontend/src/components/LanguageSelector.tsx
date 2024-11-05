import React from 'react';
import { useLanguage, Locale } from '../context/LanguageContext';
import { Globe } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { authApi } from '../services/api';

const languages: Record<Locale, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇬🇧' },
  fr: { name: 'Français', flag: '🇫🇷' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
};

const LanguageSelector: React.FC = () => {
  const { locale, setLocale } = useLanguage();
  const { isSignedIn, userId } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLanguageChange = async (code: Locale) => {
    if (isSignedIn && userId) {
      try {
        await authApi.syncUser(userId, code);
      } catch (error) {
        console.error('Error syncing language preference:', error);
      }
    }
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <Globe className="h-4 w-4" />
        <span>{languages[locale].flag}</span>
        <span className="hidden sm:inline">{languages[locale].name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            {Object.entries(languages).map(([code, { name, flag }]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as Locale)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2
                  ${locale === code ? 'bg-gray-50 text-primary-600' : 'text-gray-700'}`}
                role="menuitem"
              >
                <span className="text-xl">{flag}</span>
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 