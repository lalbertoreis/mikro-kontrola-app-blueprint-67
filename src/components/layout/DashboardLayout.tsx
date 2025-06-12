
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { OnboardingManager } from '@/components/onboarding/OnboardingManager';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <OnboardingManager />
    </div>
  );
};

export default DashboardLayout;
