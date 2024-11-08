import { BrowserRouter } from 'react-router-dom';
import Layout from './layouts/Layout';
import AppRoutes from './routes';
import { ProductProvider } from './context/ProductContext';
import { LanguageProvider } from './context/LanguageContext';
import { ClerkProviderWithLocale } from './components/ClerkProviderWithLocale';
import { Navigation } from './components/Navigation';
import { SubscriptionProvider } from './context/SubscriptionContext';
import ErrorBoundary from './components/ErrorBoundary';


function App() {
  return (
    <LanguageProvider>
      <ClerkProviderWithLocale>
        <ProductProvider>
          <SubscriptionProvider>
            <BrowserRouter>
              <Layout>
                <Navigation />
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
              </Layout>
            </BrowserRouter>
          </SubscriptionProvider>
        </ProductProvider>
      </ClerkProviderWithLocale>
    </LanguageProvider>
  );
}

export default App;
