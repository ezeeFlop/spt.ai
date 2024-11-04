import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/clerk-react';
import { Menu, Brain } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { authApi } from '../services/api';
import { useIntl } from 'react-intl';
import LanguageSelector from './LanguageSelector';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, userId } = useAuth();
  const { products } = useProducts();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const intl = useIntl();

  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || intl.formatMessage({ id: 'products.category.other' });
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (isSignedIn && userId) {
        try {
          await authApi.syncUser(userId, intl.locale);
        } catch (error) {
          console.error('Error syncing user with backend:', error);
        }
      }
    };

    if (isSignedIn && userId) {
      syncUserWithBackend();
    }
  }, [isSignedIn, userId, intl.locale]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-xl font-bold text-primary-600">
                <Brain className="h-8 w-8 mr-2" />
                <span>{intl.formatMessage({ id: 'app.name' })}</span>
              </Link>
              
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link to="/features" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  {intl.formatMessage({ id: 'app.nav.features' })}
                </Link>
                <Link to="/pricing" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  {intl.formatMessage({ id: 'app.nav.pricing' })}
                </Link>
                <Link to="/blog" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  {intl.formatMessage({ id: 'app.nav.blog' })}
                </Link>
                
                <div className="relative group">
                  <button className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium inline-flex items-center">
                    {intl.formatMessage({ id: 'app.nav.products' })}
                    <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                        <div key={category}>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {category}
                          </div>
                          {categoryProducts.map((product) => (
                            <Link
                              key={product.id}
                              to={`/products/${product.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                            >
                              {intl.formatMessage({ id: `products.${product.id}.name` })}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <LanguageSelector />
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                      {intl.formatMessage({ id: 'app.auth.signin' })}
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium">
                      {intl.formatMessage({ id: 'app.auth.signup' })}
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/features"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
              >
                {intl.formatMessage({ id: 'app.nav.features' })}
              </Link>
              <Link
                to="/pricing"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
              >
                {intl.formatMessage({ id: 'app.nav.pricing' })}
              </Link>
              <Link
                to="/blog"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
              >
                {intl.formatMessage({ id: 'app.nav.blog' })}
              </Link>
              {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <div key={category}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {category}
                  </div>
                  {categoryProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                    >
                      {intl.formatMessage({ id: `products.${product.id}.name` })}
                    </Link>
                  ))}
                </div>
              ))}
              {!isSignedIn ? (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <SignInButton mode="modal">
                    <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50">
                      {intl.formatMessage({ id: 'app.auth.signin' })}
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="mt-1 block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700">
                      {intl.formatMessage({ id: 'app.auth.signup' })}
                    </button>
                  </SignUpButton>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="px-3">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>
    </div>
  );
};

export default Layout;