import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import Layout from './components/Layout';
import AppRoutes from './routes';
import { ProductProvider } from './context/ProductContext';

const CLERK_PUBLISHABLE_KEY =
  'pk_test_ZGl2aW5lLWdob3N0LTYyLmNsZXJrLmFjY291bnRzLmRldiQ';
//NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGl2aW5lLWdob3N0LTYyLmNsZXJrLmFjY291bnRzLmRldiQ
//CLERK_SECRET_KEY=sk_test_moNlesAgJbvqh665UZ4jCuYLdS55JwJm8q83w92jl0
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

function App() {
  return (
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
  );
}

export default App;
