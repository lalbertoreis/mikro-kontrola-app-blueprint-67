
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface DashboardData {
  clientsCount: number;
  appointmentsCount: number;
  servicesCount: number;
}

export const useDashboardData = () => {
  // Using React Query to fetch dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async (): Promise<DashboardData> => {
      // In a real app, this would be an API call
      // For now, we'll simulate a network request
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            clientsCount: 25,
            appointmentsCount: 18,
            servicesCount: 12
          });
        }, 500);
      });
    }
  });

  return {
    clientsCount: data?.clientsCount || 0,
    appointmentsCount: data?.appointmentsCount || 0,
    servicesCount: data?.servicesCount || 0,
    isLoading,
    error
  };
};
