
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
    isInitialized,
    isOpen: state.isOpen,
    dontShowAgain: state.dontShowAgain
  });

  // Initialize onboarding state
  useEffect(() => {
    if (!user || loading || isInitialized) return;

    console.log('Initializing onboarding state for user:', user.id);
    const savedState = loadOnboardingState();
    
    // Se o usuário escolheu não mostrar mais, respeitar essa escolha
    if (savedState && savedState.dontShowAgain) {
      console.log('User chose not to see onboarding again');
      setState(prev => ({ ...prev, dontShowAgain: true, isOpen: false }));
      setIsInitialized(true);
      return;
    }

    // Criar estado inicial
    let initialState = {
      isOpen: false,
      currentStepIndex: 0,
      steps: [...ONBOARDING_STEPS],
      canSkip: true,
      dontShowAgain: false
    };

    // Marcar passos como completos baseado nos dados reais
    if (services.length > 0) {
      const servicesStep = initialState.steps.find(step => step.id === 'services');
      if (servicesStep) servicesStep.completed = true;
    }
    
    if (employees.length > 0) {
      const employeesStep = initialState.steps.find(step => step.id === 'employees');
      if (employeesStep) employeesStep.completed = true;
    }

    // Se tem estado salvo, usar o índice salvo, senão encontrar o primeiro incompleto
    if (savedState?.currentStepIndex !== undefined) {
      initialState.currentStepIndex = savedState.currentStepIndex;
      console.log('Using saved currentStepIndex:', savedState.currentStepIndex);
    } else {
      const firstIncompleteIndex = findFirstIncompleteStep(initialState.steps);
      if (firstIncompleteIndex !== -1) {
        initialState.currentStepIndex = firstIncompleteIndex;
      }
      console.log('Using first incomplete step index:', initialState.currentStepIndex);
    }

    // Determinar se deve abrir o onboarding
    const hasIncompleteSteps = initialState.steps.some(step => !step.completed && step.id !== 'complete');
    
    if (hasIncompleteSteps) {
      initialState.isOpen = true;
      console.log('Opening onboarding - has incomplete steps');
    } else {
      // Se todos os passos estão completos, mostrar o passo final
      initialState.currentStepIndex = initialState.steps.length - 1;
      initialState.isOpen = true;
      console.log('Opening final step - all main steps completed');
    }

    console.log('Setting initial onboarding state:', initialState);
    setState(initialState);
    setIsInitialized(true);
  }, [user, loading, services.length, employees.length, isInitialized]);

  // Check completion when data changes (only after initialization)
  useEffect(() => {
    if (!isInitialized || !user || loading || servicesLoading || employeesLoading) {
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
        currentStepIndex: newCurrentStepIndex !== undefined ? newCurrentStepIndex : state.currentStepIndex,
        isOpen: shouldAdvance ? true : state.isOpen
      };
      
      console.log('Updating state due to step completion:', newState);
      saveOnboardingState(newState);
      setState(newState);
    }
  }, [services.length, employees.length, isInitialized, user, loading, servicesLoading, employeesLoading]);

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
