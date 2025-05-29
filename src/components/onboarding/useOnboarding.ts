
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/hooks/useServices';
import { useEmployees } from '@/hooks/useEmployees';
import { OnboardingState } from './types';
import { ONBOARDING_STEPS } from './data';
import { 
  saveOnboardingState, 
  loadOnboardingState 
} from './utils/onboardingStorage';
import { 
  checkStepCompletion, 
  findFirstIncompleteStep 
} from './utils/stepCompletionChecker';
import { createOnboardingActions } from './utils/onboardingActions';
import { createPageStepHelper } from './utils/pageStepHelper';

export const useOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { services, isLoading: servicesLoading } = useServices();
  const { employees, isLoading: employeesLoading } = useEmployees();
  
  const [state, setState] = useState<OnboardingState>({
    isOpen: false,
    currentStepIndex: 0,
    steps: ONBOARDING_STEPS,
    canSkip: true,
    dontShowAgain: false
  });

  console.log('useOnboarding state:', {
    currentStepIndex: state.currentStepIndex,
    currentStepId: state.steps[state.currentStepIndex]?.id,
    servicesCount: services.length,
    employeesCount: employees.length,
    isLoading: servicesLoading || employeesLoading,
    pathname: location.pathname
  });

  // Check if steps are completed based on actual data
  const handleStepCompletion = () => {
    if (!user || servicesLoading || employeesLoading) {
      console.log('Skipping step completion check - user not loaded or data loading');
      return;
    }

    const { hasChanges, shouldAdvance, updatedSteps, newCurrentStepIndex } = checkStepCompletion({
      state,
      services,
      employees
    });

    if (hasChanges) {
      const newState = { 
        ...state, 
        steps: updatedSteps,
        currentStepIndex: newCurrentStepIndex || state.currentStepIndex
      };
      
      if (shouldAdvance) {
        console.log('Advancing to step index:', newCurrentStepIndex);
        newState.isOpen = true; // Reopen modal to show next step
      }
      
      saveOnboardingState(newState);
      setState(newState);
    }
  };

  // Load saved state from localStorage
  useEffect(() => {
    if (!user || loading) return;

    console.log('Loading onboarding state for user:', user.id);
    const savedState = loadOnboardingState();
    
    if (savedState && savedState.dontShowAgain) {
      console.log('User chose not to see onboarding again');
      setState(prev => ({ ...prev, dontShowAgain: true, isOpen: false }));
      return;
    }

    // Start with fresh steps and check completion based on current data
    let initialState = {
      isOpen: false,
      currentStepIndex: savedState?.currentStepIndex || 0,
      steps: [...ONBOARDING_STEPS],
      canSkip: true,
      dontShowAgain: false
    };

    // Check which steps should be marked as completed based on current data
    if (services.length > 0) {
      const servicesStep = initialState.steps.find(step => step.id === 'services');
      if (servicesStep) servicesStep.completed = true;
    }
    
    if (employees.length > 0) {
      const employeesStep = initialState.steps.find(step => step.id === 'employees');
      if (employeesStep) employeesStep.completed = true;
    }

    // If we have a saved currentStepIndex, use it, otherwise find first incomplete
    if (savedState?.currentStepIndex !== undefined) {
      initialState.currentStepIndex = savedState.currentStepIndex;
    } else {
      const firstIncompleteIndex = findFirstIncompleteStep(initialState.steps);
      if (firstIncompleteIndex !== -1) {
        initialState.currentStepIndex = firstIncompleteIndex;
      }
    }

    // Only open if we have incomplete steps and we're not on the final step
    const hasIncompleteSteps = initialState.steps.some(step => !step.completed && step.id !== 'complete');
    const isOnFinalStep = initialState.currentStepIndex === initialState.steps.length - 1;
    
    if (hasIncompleteSteps && !isOnFinalStep) {
      initialState.isOpen = true;
      console.log('Opening onboarding at step:', initialState.currentStepIndex, initialState.steps[initialState.currentStepIndex]?.id);
    } else if (isOnFinalStep && initialState.steps.slice(0, -1).every(step => step.completed)) {
      // All main steps completed, show final step
      initialState.isOpen = true;
      console.log('All main steps completed, showing final step');
    } else {
      console.log('All onboarding steps completed or no incomplete steps');
      initialState.isOpen = false;
    }

    console.log('Setting initial onboarding state:', initialState);
    setState(initialState);
    saveOnboardingState(initialState);
  }, [user, loading, services.length, employees.length, servicesLoading, employeesLoading]);

  // Check completion whenever services or employees change
  useEffect(() => {
    if (user && !loading && !servicesLoading && !employeesLoading && state.steps.length > 0) {
      console.log('Checking step completion due to data change');
      handleStepCompletion();
    }
  }, [services.length, employees.length]);

  // Create action handlers
  const actions = createOnboardingActions({ state, setState, navigate });

  // Create page step helper
  const pageHelper = createPageStepHelper(state, location.pathname);

  return {
    isOpen: state.isOpen,
    currentStep: state.steps[state.currentStepIndex],
    currentStepIndex: state.currentStepIndex,
    steps: state.steps,
    dontShowAgain: state.dontShowAgain,
    isOnboardingActive: pageHelper.isOnboardingActive,
    getCurrentStepForPage: pageHelper.getCurrentStepForPage,
    setDontShowAgain: actions.setDontShowAgain,
    nextStep: actions.nextStep,
    goToStep: actions.goToStep,
    skipTutorial: actions.skipTutorial,
    closeTutorial: actions.closeTutorial,
    resetOnboarding: actions.resetOnboarding
  };
};
