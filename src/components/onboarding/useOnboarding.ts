
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

  const [isInitialized, setIsInitialized] = useState(false);

  console.log('useOnboarding state:', {
    currentStepIndex: state.currentStepIndex,
    currentStepId: state.steps[state.currentStepIndex]?.id,
    servicesCount: services.length,
    employeesCount: employees.length,
    isLoading: servicesLoading || employeesLoading,
    pathname: location.pathname,
    isInitialized
  });

  // Initialize onboarding state only once
  useEffect(() => {
    if (!user || loading || isInitialized) return;

    console.log('Initializing onboarding state for user:', user.id);
    const savedState = loadOnboardingState();
    
    if (savedState && savedState.dontShowAgain) {
      console.log('User chose not to see onboarding again');
      setState(prev => ({ ...prev, dontShowAgain: true, isOpen: false }));
      setIsInitialized(true);
      return;
    }

    // Create initial state with fresh steps
    let initialState = {
      isOpen: false,
      currentStepIndex: 0,
      steps: [...ONBOARDING_STEPS],
      canSkip: true,
      dontShowAgain: false
    };

    // If we have saved state, use the saved currentStepIndex
    if (savedState?.currentStepIndex !== undefined) {
      initialState.currentStepIndex = savedState.currentStepIndex;
      console.log('Using saved currentStepIndex:', savedState.currentStepIndex);
    }

    // Mark steps as completed based on actual data (only if not manually reset)
    if (!savedState || savedState.currentStepIndex === undefined || savedState.currentStepIndex > 0) {
      if (services.length > 0) {
        const servicesStep = initialState.steps.find(step => step.id === 'services');
        if (servicesStep) servicesStep.completed = true;
      }
      
      if (employees.length > 0) {
        const employeesStep = initialState.steps.find(step => step.id === 'employees');
        if (employeesStep) employeesStep.completed = true;
      }

      // If no saved step index, find first incomplete
      if (!savedState?.currentStepIndex && savedState?.currentStepIndex !== 0) {
        const firstIncompleteIndex = findFirstIncompleteStep(initialState.steps);
        if (firstIncompleteIndex !== -1) {
          initialState.currentStepIndex = firstIncompleteIndex;
        }
      }
    }

    // Determine if should open
    const hasIncompleteSteps = initialState.steps.some(step => !step.completed && step.id !== 'complete');
    const isOnFinalStep = initialState.currentStepIndex === initialState.steps.length - 1;
    
    if (hasIncompleteSteps && !isOnFinalStep) {
      initialState.isOpen = true;
      console.log('Opening onboarding at step:', initialState.currentStepIndex, initialState.steps[initialState.currentStepIndex]?.id);
    } else if (isOnFinalStep && initialState.steps.slice(0, -1).every(step => step.completed)) {
      initialState.isOpen = true;
      console.log('All main steps completed, showing final step');
    } else {
      console.log('All onboarding steps completed or no incomplete steps');
      initialState.isOpen = false;
    }

    console.log('Setting initial onboarding state:', initialState);
    setState(initialState);
    setIsInitialized(true);
  }, [user, loading, services.length, employees.length, isInitialized]);

  // Check completion when data changes (only after initialization)
  useEffect(() => {
    if (!isInitialized || !user || loading || servicesLoading || employeesLoading || state.steps.length === 0) {
      return;
    }

    console.log('Checking step completion due to data change');
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
        newState.isOpen = true;
      }
      
      saveOnboardingState(newState);
      setState(newState);
    }
  }, [services.length, employees.length, isInitialized]);

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
