import { BrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import AppRoutes from './routes';
import { ProductProvider } from './context/ProductContext';
import { LanguageProvider } from './context/LanguageContext';
import { ClerkProviderWithLocale } from './components/ClerkProviderWithLocale';
import { Navigation } from './components/Navigation';

function App() {
  return (
    <LanguageProvider>
      <ClerkProviderWithLocale>
        <ProductProvider>
          <BrowserRouter>
            <Layout>
              <Navigation />
              <AppRoutes />
            </Layout>
          </BrowserRouter>
        </ProductProvider>
      </ClerkProviderWithLocale>
    </LanguageProvider>
  );
}

export default App;
