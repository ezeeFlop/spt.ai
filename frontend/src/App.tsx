import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import Layout from './components/Layout';
import AppRoutes from './routes';
import { ProductProvider } from './context/ProductContext';
import { LanguageProvider } from './context/LanguageContext';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

function App() {
  return (
    <LanguageProvider>
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        appearance={{
          baseTheme: undefined,
          elements: {
            formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
            footerActionLink: 'text-purple-600 hover:text-purple-700',
          },
        }}
      > 
        <ProductProvider>
          <BrowserRouter>
            <Layout>
              <AppRoutes />
            </Layout>
          </BrowserRouter>
        </ProductProvider>
      </ClerkProvider>
    </LanguageProvider>
  );
}

export default App;
