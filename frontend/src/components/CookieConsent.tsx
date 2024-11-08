import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const CookieConsent = () => {
  const intl = useIntl();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-2 rounded-lg bg-primary-600 shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <p className="ml-3 font-medium text-white truncate">
                <span className="md:hidden">
                  {intl.formatMessage({ id: 'cookie.shortMessage' })}
                </span>
                <span className="hidden md:inline">
                  {intl.formatMessage({ id: 'cookie.message' })}
                </span>
              </p>
            </div>
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <div className="flex space-x-4">
                <button
                  onClick={handleAccept}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50"
                >
                  {intl.formatMessage({ id: 'cookie.accept' })}
                </button>
                <button
                  onClick={handleDecline}
                  className="flex items-center justify-center px-4 py-2 border border-white rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700"
                >
                  {intl.formatMessage({ id: 'cookie.decline' })}
                </button>
              </div>
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <Link
                to="/privacy"
                className="text-sm text-white hover:text-primary-100 underline mr-4"
              >
                {intl.formatMessage({ id: 'cookie.learnMore' })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
