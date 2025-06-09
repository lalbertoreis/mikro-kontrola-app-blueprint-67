
import { OnboardingState } from './types';
import { ONBOARDING_STEPS } from './constants';
import { saveOnboardingState, clearOnboardingState } from './storage';

export const useOnboardingActions = (
  currentState: OnboardingState,
  setState: (state: Partial<OnboardingState>) => void,
  setIsOpen: (isOpen: boolean) => void
) => {
  const saveState = (newState: Partial<OnboardingState>) => {
    const updatedState = { ...currentState, ...newState };
    saveOnboardingState(updatedState);
    setState(newState);
  };

  const nextStep = () => {
    const nextStepIndex = currentState.currentStep + 1;
    if (nextStepIndex < ONBOARDING_STEPS.length) {
      saveState({ currentStep: nextStepIndex });
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    const prevStepIndex = currentState.currentStep - 1;
    if (prevStepIndex >= 0) {
      saveState({ currentStep: prevStepIndex });
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
      saveState({ currentStep: stepIndex });
    }
  };

  const skipOnboarding = () => {
    saveState({ isSkipped: true, isVisible: false });
    setIsOpen(false);
  };

  const completeOnboarding = () => {
    saveState({ isCompleted: true, isVisible: false });
    setIsOpen(false);
  };

  const resetOnboarding = () => {
    clearOnboardingState();
    setState({
      currentStep: 0,
      isCompleted: false,
      isSkipped: false,
      isVisible: true
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    if (!currentState.isCompleted && !currentState.isSkipped) {
      saveState({ isVisible: true });
      setIsOpen(true);
    }
  };

  const hideWizard = () => {
    saveState({ isVisible: false });
    setIsOpen(false);
  };

  const showWizard = () => {
    if (!currentState.isCompleted && !currentState.isSkipped) {
      saveState({ isVisible: true });
      setIsOpen(true);
    }
  };

  return {
    nextStep,
    previousStep,
    goToStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    closeModal,
    openModal,
    hideWizard,
    showWizard
  };
};
