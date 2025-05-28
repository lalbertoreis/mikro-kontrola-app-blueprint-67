
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
  const { services } = useServices();
  const { employees } = useEmployees();
  
  const [state, setState] = useState<OnboardingState>({
    isOpen: false,
    currentStepIndex: 0,
    steps: ONBOARDING_STEPS,
    canSkip: true,
    dontShowAgain: false
  });

  // Check if steps are completed based on actual data
  const handleStepCompletion = () => {
    if (!user) return;

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
          newState.currentStepIndex = nextIncompleteIndex;
          newState.isOpen = true; // Reopen modal to show next step
        } else {
          // All steps completed
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
        return; // Don't show onboarding if user chose not to see it again
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

    setState(initialState);
  }, [user, loading]);

  // Check completion whenever services or employees change
  useEffect(() => {
    if (user && !loading && state.isOpen) {
      handleStepCompletion();
    }
  }, [services, employees, user, loading]);

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
