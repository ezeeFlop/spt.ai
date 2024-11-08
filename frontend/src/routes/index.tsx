import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Features from '../pages/Features';
import Pricing from '../pages/Pricing';
import { BlogLayout } from '../layouts/BlogLayout';
import { BlogIndexPage } from '../pages/blog';
import { BlogPostPage } from '../pages/blog/[slug]';
import Dashboard from '../pages/Dashboard';
import ListUsers from '../pages/admin/ListUsers';
import ListTiers from '../pages/admin/ListTiers';
import ListProducts from '../pages/admin/ListProducts';
import ProductDetail from '../pages/ProductDetail';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardStats from '../pages/admin/DashboardStats';
import ListBlogPosts from '../pages/admin/ListBlogPosts';
import BlogEditor from '../pages/admin/BlogEditor';
import MediaLibrary from '../pages/admin/MediaLibrary';
import Settings from '../pages/admin/Settings';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/blog" element={<BlogLayout />}>
        <Route index element={<BlogIndexPage />} />
        <Route path=":slug" element={<BlogPostPage />} />
      </Route>
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<ListUsers />} />
        <Route path="tiers" element={<ListTiers />} />
        <Route path="products" element={<ListProducts />} />
        <Route path="statistics" element={<DashboardStats />} />
        <Route path="blog" element={<ListBlogPosts />} />
        <Route path="blog/new" element={<BlogEditor />} />
        <Route path="blog/:slug/edit" element={<BlogEditor />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;