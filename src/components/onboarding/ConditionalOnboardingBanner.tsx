
import React from 'react';
import { useLocation } from 'react-router-dom';
import { OnboardingBanner } from './OnboardingBanner';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';

const STEP_ROUTES = {
  '/dashboard/services': 'services',
  '/dashboard/employees': 'employees', 
  '/dashboard/clients': 'clients'
};

export const ConditionalOnboardingBanner: React.FC = () => {
  const location = useLocation();
  const stepId = STEP_ROUTES[location.pathname as keyof typeof STEP_ROUTES];
  const { isCompleted, isLoading } = useOnboardingCheck(stepId);

  // Não mostrar se não há step para esta página
  if (!stepId) {
    return null;
  }

  // Não mostrar enquanto carrega
  if (isLoading) {
    return null;
  }

  // Não mostrar se já está concluído
  if (isCompleted) {
    return null;
  }

  return <OnboardingBanner />;
};
