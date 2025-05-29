
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
  findNextIncompleteStep, 
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

    const { hasChanges, shouldAdvance, updatedSteps } = checkStepCompletion({
      state,
      services,
      employees
    });

    if (hasChanges) {
      const newState = { ...state, steps: updatedSteps };
      
      if (shouldAdvance) {
        // Find next incomplete step
        const nextIncompleteIndex = findNextIncompleteStep(updatedSteps, state.currentStepIndex);
        
        if (nextIncompleteIndex !== -1) {
          console.log('Advancing to step index:', nextIncompleteIndex);
          newState.currentStepIndex = nextIncompleteIndex;
          newState.isOpen = true; // Reopen modal to show next step
        } else {
          // All steps completed
          console.log('All steps completed, going to final step');
          newState.currentStepIndex = updatedSteps.length - 1;
          newState.isOpen = true;
        }
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
    
    // Always start with fresh steps to check completion
    let initialState = {
      isOpen: false, // Start closed, will open if needed
      currentStepIndex: 0,
      steps: [...ONBOARDING_STEPS], // Fresh copy
      canSkip: true,
      dontShowAgain: false
    };

    if (savedState && savedState.dontShowAgain) {
      console.log('User chose not to see onboarding again');
      setState(prev => ({ ...prev, dontShowAgain: true, isOpen: false }));
      return;
    }

    // Check which steps should be marked as completed based on current data
    if (services.length > 0) {
      const servicesStep = initialState.steps.find(step => step.id === 'services');
      if (servicesStep) servicesStep.completed = true;
    }
    
    if (employees.length > 0) {
      const employeesStep = initialState.steps.find(step => step.id === 'employees');
      if (employeesStep) employeesStep.completed = true;
    }

    // Find first incomplete step to start from
    const firstIncompleteIndex = findFirstIncompleteStep(initialState.steps);
    
    if (firstIncompleteIndex !== -1 && firstIncompleteIndex !== initialState.steps.length - 1) {
      // There are incomplete steps, start onboarding from first incomplete
      initialState.currentStepIndex = firstIncompleteIndex;
      initialState.isOpen = true;
      console.log('Starting onboarding from step:', firstIncompleteIndex, initialState.steps[firstIncompleteIndex].id);
    } else if (firstIncompleteIndex === initialState.steps.length - 1) {
      // Only final step remains
      initialState.currentStepIndex = firstIncompleteIndex;
      initialState.isOpen = true;
      console.log('All main steps completed, showing final step');
    } else {
      // All steps completed
      console.log('All onboarding steps completed');
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
