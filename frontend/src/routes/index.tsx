import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Features from '../pages/Features';
import Pricing from '../pages/Pricing';
import ProductPage from '../pages/ProductPage';
import BlogIndex from './blog';
import BlogPostPage from '../pages/BlogPostPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/products/:id" element={<ProductPage />} />
      <Route path="/blog" element={<BlogIndex />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
    </Routes>
  );
};

export default AppRoutes;