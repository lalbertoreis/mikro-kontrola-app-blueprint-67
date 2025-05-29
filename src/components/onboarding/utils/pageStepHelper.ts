
import { OnboardingState } from '../types';

export const createPageStepHelper = (state: OnboardingState, pathname: string) => {
  const getCurrentStepForPage = () => {
    console.log('getCurrentStepForPage called with:', {
      pathname,
      dontShowAgain: state.dontShowAgain,
      currentStepIndex: state.currentStepIndex,
      currentStepId: state.steps[state.currentStepIndex]?.id
    });

    // Check if we're in onboarding mode (not dontShowAgain and has incomplete steps)
    if (state.dontShowAgain) {
      console.log('Not showing step - user chose dont show again');
      return null;
    }
    
    const incompleteSteps = state.steps.filter(step => !step.completed);
    if (incompleteSteps.length === 0) {
      console.log('Not showing step - all steps completed');
      return null;
    }
    
    // Find step that matches current route and is not completed
    const matchingStep = state.steps.find(step => step.route === pathname && !step.completed);
    
    if (!matchingStep) {
      console.log('No matching step found for pathname:', pathname);
      return null;
    }
    
    // Also check if this is the current step in the sequence
    const currentStep = state.steps[state.currentStepIndex];
    if (currentStep && matchingStep.id === currentStep.id) {
      console.log('Returning current step for page:', matchingStep.id);
      return matchingStep;
    }
    
    console.log('Step found but not current step in sequence');
    return null;
  };

  const isOnboardingActive = !state.dontShowAgain && 
    state.steps.some(step => !step.completed && step.id !== 'welcome' && step.id !== 'complete');

  console.log('pageStepHelper created with isOnboardingActive:', isOnboardingActive);

  return {
    getCurrentStepForPage,
    isOnboardingActive
  };
};
