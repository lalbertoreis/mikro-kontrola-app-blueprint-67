
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
    let initialState = {
      isOpen: true,
      currentStepIndex: 0,
      steps: ONBOARDING_STEPS,
      canSkip: true,
      dontShowAgain: false
    };

    if (savedState) {
      if (savedState.dontShowAgain) {
        console.log('User chose not to see onboarding again');
        setState(prev => ({ ...prev, dontShowAgain: true, isOpen: false }));
        return;
      }
      initialState = {
        ...initialState,
        currentStepIndex: savedState.currentStepIndex || 0,
        steps: savedState.steps || ONBOARDING_STEPS,
        dontShowAgain: savedState.dontShowAgain || false
      };
    }

    // Find first incomplete step to resume from
    const firstIncompleteIndex = findFirstIncompleteStep(initialState.steps);
    if (firstIncompleteIndex !== -1 && firstIncompleteIndex !== initialState.steps.length - 1) {
      initialState.currentStepIndex = firstIncompleteIndex;
    }

    console.log('Setting initial onboarding state:', initialState);
    setState(initialState);
  }, [user, loading]);

  // Check completion whenever services or employees change
  useEffect(() => {
    if (user && !loading && !servicesLoading && !employeesLoading) {
      console.log('Checking step completion due to data change');
      handleStepCompletion();
    }
  }, [services.length, employees.length, user, loading, servicesLoading, employeesLoading]);

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
    closeTutorial: actions.closeTutorial
  };
};
