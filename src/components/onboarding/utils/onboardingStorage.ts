
import { OnboardingState } from '../types';

export const STORAGE_KEY = 'kontrola-onboarding-state';

export const saveOnboardingState = (state: Partial<OnboardingState>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    currentStepIndex: state.currentStepIndex,
    steps: state.steps,
    dontShowAgain: state.dontShowAgain
  }));
};

export const loadOnboardingState = () => {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (!savedState) return null;
  
  try {
    return JSON.parse(savedState);
  } catch (error) {
    console.error('Error parsing onboarding state:', error);
    return null;
  }
};
