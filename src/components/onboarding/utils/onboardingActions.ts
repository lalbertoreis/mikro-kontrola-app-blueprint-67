
import { OnboardingState } from '../types';
import { saveOnboardingState } from './onboardingStorage';
import { ONBOARDING_STEPS } from '../data';

interface OnboardingActionsParams {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  navigate: (path: string) => void;
}

export const createOnboardingActions = ({
  state,
  setState,
  navigate
}: OnboardingActionsParams) => {
  
  const nextStep = () => {
    const currentStep = state.steps[state.currentStepIndex];
    
    if (currentStep.route) {
      // Navigate to the step's route
      navigate(currentStep.route);
      
      // Close modal temporarily while user completes the task
      setState(prev => ({ ...prev, isOpen: false }));
      
      // The step completion will be detected by the useEffect
      // and will automatically advance and reopen the modal
    } else {
      // Just move to next step for steps without routes
      const nextIndex = state.currentStepIndex + 1;
      if (nextIndex < state.steps.length) {
        const newState = { ...state, currentStepIndex: nextIndex };
        saveOnboardingState(newState);
        setState(newState);
      }
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      const newState = { ...state, currentStepIndex: stepIndex };
      saveOnboardingState(newState);
      setState(newState);
    }
  };

  const skipTutorial = () => {
    const newState = {
      ...state,
      isOpen: false,
      currentStepIndex: state.steps.length - 1,
      dontShowAgain: true
    };
    saveOnboardingState(newState);
    setState(newState);
  };

  const closeTutorial = () => {
    if (state.dontShowAgain) {
      const newState = { ...state, dontShowAgain: true };
      saveOnboardingState(newState);
    }
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const setDontShowAgain = (value: boolean) => {
    setState(prev => ({ ...prev, dontShowAgain: value }));
  };

  const resetOnboarding = () => {
    console.log('Resetting onboarding to beginning');
    const newState = {
      isOpen: true,
      currentStepIndex: 0,
      steps: ONBOARDING_STEPS.map(step => ({ ...step, completed: false })), // Reset all steps
      canSkip: true,
      dontShowAgain: false
    };
    saveOnboardingState(newState);
    setState(newState);
    navigate('/dashboard'); // Navigate to dashboard to start fresh
  };

  return {
    nextStep,
    goToStep,
    skipTutorial,
    closeTutorial,
    setDontShowAgain,
    resetOnboarding
  };
};
