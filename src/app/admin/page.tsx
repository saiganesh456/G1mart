import React from 'react';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '@/data/demo-seed';
import AdminDashboardClient from './AdminDashboardClient';

export default function AdminPage() {
  return (
    <AdminDashboardClient
      initialProducts={DEMO_PRODUCTS}
      categories={DEMO_CATEGORIES}
    />
  );
}
