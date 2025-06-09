
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { OnboardingProgress, OnboardingSettings } from '@/types/onboarding';
import { OnboardingState } from './types';
import { ONBOARDING_STEPS } from './data';
import { isStepCompleted, getNextIncompleteStepIndex } from './onboardingHelpers';

export const useOnboardingInitialization = (
  user: any,
  loading: boolean,
  servicesLoading: boolean,
  employeesLoading: boolean,
  progressLoading: boolean,
  services: any[],
  employees: any[],
  progress: OnboardingProgress[],
  settings: OnboardingSettings,
  isInitialized: boolean,
  hasRunInitialDetection: boolean,
  hasNavigatedFromModal: boolean,
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  setIsInitialized: (value: boolean) => void,
  setHasRunInitialDetection: (value: boolean) => void,
  setHasNavigatedFromModal: (value: boolean) => void,
  updateSettings: (settings: Partial<OnboardingSettings>) => Promise<void>,
  detectAndMarkCompletedSteps: (servicesCount: number, employeesCount: number) => Promise<void>
) => {
  const location = useLocation();

  // Auto-detection effect
  useEffect(() => {
    if (!user || loading || servicesLoading || employeesLoading || progressLoading || !isInitialized) {
      return;
    }

    if (!hasRunInitialDetection && progress.length === 0 && (services.length > 0 || employees.length > 0)) {
      console.log('Running initial auto-detection of completed steps - no existing progress found');
      detectAndMarkCompletedSteps(services.length, employees.length);
      setHasRunInitialDetection(true);
    }
  }, [services.length, employees.length, user, loading, servicesLoading, employeesLoading, progressLoading, isInitialized, hasRunInitialDetection, progress.length, detectAndMarkCompletedSteps]);

  // Main initialization effect - SIMPLIFICADO
  useEffect(() => {
    if (!user || loading || progressLoading) return;

    console.log('Initializing onboarding state', { 
      servicesCount: services.length, 
      employeesCount: employees.length,
      progressSteps: progress.map(p => ({ id: p.step_id, completed: p.completed })),
      dontShowAgain: settings.dont_show_again,
      isCompleted: settings.is_completed,
      currentStepIndex: settings.current_step_index,
      hasNavigatedFromModal
    });

    // Se usuário optou por não mostrar mais, não inicializar
    if (settings.dont_show_again) {
      setState(prev => ({ ...prev, dontShowAgain: true, isOpen: false }));
      setIsInitialized(true);
      return;
    }

    const updatedSteps = ONBOARDING_STEPS.map(step => ({
      ...step,
      completed: isStepCompleted(step.id, progress)
    }));

    let targetStepIndex = settings.current_step_index;
    
    if (targetStepIndex < 0 || targetStepIndex >= ONBOARDING_STEPS.length) {
      targetStepIndex = getNextIncompleteStepIndex(progress);
    }
    
    const allMainStepsComplete = ONBOARDING_STEPS.slice(0, -1).every(step => isStepCompleted(step.id, progress));

    // LÓGICA CRUCIAL SIMPLIFICADA: 
    // 1. Se navegou do modal = NÃO mostrar
    // 2. Se todos steps completos E is_completed = NÃO mostrar  
    // 3. Caso contrário = mostrar
    let shouldShowOnboarding = true;

    if (hasNavigatedFromModal) {
      shouldShowOnboarding = false;
      console.log('NOT showing onboarding - user navigated from modal');
    } else if (allMainStepsComplete && settings.is_completed) {
      shouldShowOnboarding = false;
      console.log('NOT showing onboarding - all steps completed');
    } else {
      console.log('SHOWING onboarding - conditions met');
    }

    const initialState = {
      isOpen: shouldShowOnboarding,
      currentStepIndex: targetStepIndex,
      steps: updatedSteps,
      canSkip: true,
      dontShowAgain: settings.dont_show_again
    };

    setState(initialState);
    
    // Só atualizar índice se realmente mudou
    if (settings.current_step_index !== targetStepIndex) {
      console.log('Updating current step index from', settings.current_step_index, 'to', targetStepIndex);
      updateSettings({ current_step_index: targetStepIndex });
    }
    
    setIsInitialized(true);
  }, [user, loading, progressLoading, progress, settings, services.length, employees.length]);

  return {
    // No return values needed, this hook manages effects only
  };
};
