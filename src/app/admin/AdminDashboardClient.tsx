'use client';

import React, { useState, useEffect } from 'react';
import MobileAdminDashboardClient from './MobileAdminDashboardClient';
import DesktopAdminDashboardClient from './DesktopAdminDashboardClient';

export default function AdminDashboardClient() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Avoid hydration mismatch by rendering nothing until mounted
  if (isMobile === null) return null;

  return isMobile ? <MobileAdminDashboardClient /> : <DesktopAdminDashboardClient />;
}
