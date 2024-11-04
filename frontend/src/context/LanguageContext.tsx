import React, { createContext, useContext, useState, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import en from '../i18n/messages/en';
import fr from '../i18n/messages/fr';
import es from '../i18n/messages/es';
import de from '../i18n/messages/de';

export type Locale = 'en' | 'fr' | 'es' | 'de';

const messages = { en, fr, es, de };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    const browserLocale = navigator.language.split('-')[0] as Locale;
    return savedLocale || (messages[browserLocale] ? browserLocale : 'en');
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <IntlProvider
        messages={messages[locale]}
        locale={locale}
        defaultLocale="en"
        onError={(err) => {
          if (err === 'MISSING_TRANSLATION') {
            console.warn('Missing translation');
            return;
          }
          console.error('Intl Error:', err);
        }}
      >
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
}; 