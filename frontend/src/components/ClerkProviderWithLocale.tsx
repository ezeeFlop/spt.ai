import { ClerkProvider } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';
import { enUS, frFR, esES, deDE } from '@clerk/localizations';
import UserTierInfo from './UserTierInfo';
import { useEffect, useState } from 'react';

const localizations = {
  en: enUS,
  fr: frFR,
  es: esES,
  de: deDE,
};

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const ClerkProviderWithLocale = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useLanguage();
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [locale]);

  return (
    <ClerkProvider
      key={key}
      publishableKey={CLERK_PUBLISHABLE_KEY}
      localization={localizations[locale]}
      appearance={{
        baseTheme: undefined,
        elements: {
          formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
          footerActionLink: 'text-purple-600 hover:text-purple-700',
          userProfile: {
            root: 'w-full',
          },
          card: {
            root: 'w-full max-w-none'
          },
          navbar: {
            root: 'w-full'
          },
          profileSection: {
            root: 'w-full'
          }
        },
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
          helpPageUrl: "/help",
          privacyPageUrl: "/privacy",
          termsPageUrl: "/terms"
        },
        signIn: {
          start: {
            userProfileContent: {
              beforeContent: <UserTierInfo />
            }
          }
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
};
