
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
    } else {
      console.log('Skipping auto-detection:', {
        hasRunInitialDetection,
        progressExists: progress.length > 0,
        hasData: services.length > 0 || employees.length > 0
      });
    }
  }, [services.length, employees.length, user, loading, servicesLoading, employeesLoading, progressLoading, isInitialized, hasRunInitialDetection, progress.length, detectAndMarkCompletedSteps]);

  // Main initialization effect
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

    if (settings.dont_show_again) {
      setState(prev => ({ ...prev, dontShowAgain: true, isOpen: false }));
      setIsInitialized(true);
      return;
    }

    const updatedSteps = ONBOARDING_STEPS.map(step => ({
      ...step,
      completed: isStepCompleted(step.id, progress)
    }));

    const nextIncompleteIndex = getNextIncompleteStepIndex(progress);
    
    console.log('Next incomplete step index:', nextIncompleteIndex, 'Step:', ONBOARDING_STEPS[nextIncompleteIndex]?.id);
    
    const allMainStepsComplete = ONBOARDING_STEPS.slice(0, -1).every(step => isStepCompleted(step.id, progress));

    let shouldShowOnboarding = true;

    if (allMainStepsComplete && settings.is_completed) {
      shouldShowOnboarding = false;
    }

    if (hasNavigatedFromModal) {
      shouldShowOnboarding = false;
    }

    const initialState = {
      isOpen: shouldShowOnboarding,
      currentStepIndex: nextIncompleteIndex,
      steps: updatedSteps,
      canSkip: true,
      dontShowAgain: settings.dont_show_again
    };

    setState(initialState);
    
    if (settings.current_step_index !== nextIncompleteIndex) {
      console.log('Updating current step index from', settings.current_step_index, 'to', nextIncompleteIndex);
      updateSettings({ current_step_index: nextIncompleteIndex });
    }
    
    setIsInitialized(true);
  }, [user, loading, progressLoading, progress, settings, hasNavigatedFromModal, services.length, employees.length]);

  // Reset navigation flag effect
  useEffect(() => {
    if (hasNavigatedFromModal && setState && location.pathname) {
      // This effect needs access to current step, so we'll handle it in the main hook
    }
  }, [location.pathname, hasNavigatedFromModal]);

  return {
    // No return values needed, this hook manages effects only
  };
};
