
import { OnboardingState } from '../types';

export const createPageStepHelper = (state: OnboardingState, pathname: string) => {
  const getCurrentStepForPage = () => {
    // Check if we're in onboarding mode (not dontShowAgain and has incomplete steps)
    if (state.dontShowAgain) return null;
    
    const incompleteSteps = state.steps.filter(step => !step.completed);
    if (incompleteSteps.length === 0) return null;
    
    // Find step that matches current route and is not completed
    const matchingStep = state.steps.find(step => step.route === pathname && !step.completed);
    
    // Also check if this is the current step in the sequence
    const currentStep = state.steps[state.currentStepIndex];
    if (matchingStep && currentStep && matchingStep.id === currentStep.id) {
      return matchingStep;
    }
    
    return null;
  };

  const isOnboardingActive = !state.dontShowAgain && 
    state.steps.some(step => !step.completed && step.id !== 'welcome' && step.id !== 'complete');

  return {
    getCurrentStepForPage,
    isOnboardingActive
  };
};
