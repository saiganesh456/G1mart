import React from 'react';
import { productService } from '@/services/productService';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  const [products, categories] = await Promise.all([
    productService.getProducts(),
    productService.getCategories(),
  ]);

  return (
    <AdminDashboardClient
      initialProducts={products}
      categories={categories}
    />
  );
}
