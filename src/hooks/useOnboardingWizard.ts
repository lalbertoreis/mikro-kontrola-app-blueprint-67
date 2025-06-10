
import { useOnboardingState } from './onboarding/useOnboardingState';
import { useOnboardingActions } from './onboarding/useOnboardingActions';
import { ONBOARDING_STEPS } from '@/data/onboardingSteps';

export { OnboardingStep } from '@/types/onboardingTypes';

export const useOnboardingWizard = () => {
  const state = useOnboardingState();
  const actions = useOnboardingActions();

  console.log('useOnboardingWizard render:', {
    state
  });

  return {
    // Estado reativo
    isOpen: state.isWizardVisible,
    currentStep: state.currentStep,
    currentStepData: ONBOARDING_STEPS[state.currentStep],
    totalSteps: ONBOARDING_STEPS.length,
    isCompleted: state.isCompleted,
    isSkipped: state.isSkipped,
    isWizardVisible: state.isWizardVisible,
    steps: ONBOARDING_STEPS,
    
    // Ações
    nextStep: () => actions.nextStep(state.currentStep),
    previousStep: () => actions.previousStep(state.currentStep),
    goToStep: actions.goToStep,
    skipOnboarding: actions.skipOnboarding,
    completeOnboarding: actions.completeOnboarding,
    resetOnboarding: actions.resetOnboarding,
    closeModal: actions.closeModal,
    hideWizard: actions.hideWizard,
    showWizard: actions.showWizard,
    
    // Helpers
    isFirstStep: state.currentStep === 0,
    isLastStep: state.currentStep === ONBOARDING_STEPS.length - 1,
    progress: ((state.currentStep + 1) / ONBOARDING_STEPS.length) * 100
  };
};
