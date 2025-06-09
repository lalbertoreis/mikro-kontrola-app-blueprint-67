
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/hooks/useServices';
import { useEmployees } from '@/hooks/useEmployees';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { ONBOARDING_STEPS } from './data';
import { useOnboardingState } from './onboardingState';
import { useOnboardingNavigation } from './onboardingNavigation';
import { useOnboardingInitialization } from './onboardingInitialization';
import { 
  isStepCompleted, 
  getCurrentStepForPage, 
  isOnboardingActive 
} from './onboardingHelpers';

export const useOnboarding = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const { services, isLoading: servicesLoading } = useServices();
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { 
    progress, 
    settings, 
    isLoading: progressLoading, 
    markStepCompleted, 
    updateSettings, 
    resetOnboarding,
    detectAndMarkCompletedSteps
  } = useOnboardingProgress();
  
  const {
    state,
    setState,
    isInitialized,
    setIsInitialized,
    hasRunInitialDetection,
    setHasRunInitialDetection,
    hasNavigatedFromModal,
    setHasNavigatedFromModal
  } = useOnboardingState();

  const navigation = useOnboardingNavigation(
    state,
    setState,
    updateSettings,
    setHasNavigatedFromModal,
    progress,
    markStepCompleted // Passar markStepCompleted para o navigation
  );

  // Initialize onboarding
  useOnboardingInitialization(
    user,
    loading,
    servicesLoading,
    employeesLoading,
    progressLoading,
    services,
    employees,
    progress,
    settings,
    isInitialized,
    hasRunInitialDetection,
    hasNavigatedFromModal,
    setState,
    setIsInitialized,
    setHasRunInitialDetection,
    setHasNavigatedFromModal,
    updateSettings,
    detectAndMarkCompletedSteps
  );

  // Reset flag when location changes but prevent modal from reopening immediately
  useEffect(() => {
    if (hasNavigatedFromModal && state.steps[state.currentStepIndex]?.route !== location.pathname) {
      console.log('Location changed, clearing hasNavigatedFromModal flag');
      setHasNavigatedFromModal(false);
      
      // Não reabrir o modal imediatamente se ainda estamos numa página com step
      const currentPageStep = getCurrentStepForPage(
        location.pathname, 
        state.steps, 
        progress, 
        settings.dont_show_again, 
        isInitialized
      );
      
      if (!currentPageStep) {
        console.log('No step for current page, potentially reopening modal');
        // Usar um timeout para evitar abertura imediata
        setTimeout(() => {
          setState(prev => ({ ...prev, isOpen: true }));
        }, 500);
      }
    }
  }, [location.pathname, hasNavigatedFromModal, state.currentStepIndex, state.steps]);

  const handleResetOnboarding = async () => {
    console.log('Resetting onboarding');
    await resetOnboarding();
    
    const resetSteps = ONBOARDING_STEPS.map(step => ({ ...step, completed: false }));
    setState({
      isOpen: true,
      currentStepIndex: 0,
      steps: resetSteps,
      canSkip: true,
      dontShowAgain: false
    });
    
    setHasRunInitialDetection(false);
    setHasNavigatedFromModal(false);
    
    console.log('Onboarding reset completed - state updated to step 0');
  };

  return {
    isOpen: state.isOpen,
    currentStep: state.steps[state.currentStepIndex],
    currentStepIndex: state.currentStepIndex,
    steps: state.steps.map(step => ({ ...step, completed: isStepCompleted(step.id, progress) })),
    dontShowAgain: state.dontShowAgain,
    isOnboardingActive: isOnboardingActive(settings.dont_show_again, state.steps, progress),
    getCurrentStepForPage: () => getCurrentStepForPage(
      location.pathname, 
      state.steps, 
      progress, 
      settings.dont_show_again, 
      isInitialized
    ),
    reopenModal: navigation.reopenModal,
    advanceOnboarding: navigation.advanceOnboarding,
    setDontShowAgain: navigation.setDontShowAgain,
    nextStep: navigation.nextStep,
    goToStep: navigation.goToStep,
    skipTutorial: navigation.skipTutorial,
    closeTutorial: navigation.closeTutorial,
    resetOnboarding: handleResetOnboarding,
    markStepCompleted,
    updateSettings
  };
};
