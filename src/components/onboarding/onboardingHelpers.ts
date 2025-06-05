
import { OnboardingProgress } from '@/types/onboarding';
import { ONBOARDING_STEPS } from './data';

export const isStepCompleted = (stepId: string, progress: OnboardingProgress[]) => {
  const stepProgress = progress.find(p => p.step_id === stepId);
  return stepProgress?.completed || false;
};

export const getNextIncompleteStepIndex = (progress: OnboardingProgress[]) => {
  const incompleteStepIndex = ONBOARDING_STEPS.findIndex(step => !isStepCompleted(step.id, progress));
  return incompleteStepIndex >= 0 ? incompleteStepIndex : ONBOARDING_STEPS.length - 1;
};

export const getCurrentStepForPage = (
  pathname: string,
  steps: any[],
  progress: OnboardingProgress[],
  dontShowAgain: boolean,
  isInitialized: boolean
) => {
  if (dontShowAgain || !isInitialized) return null;
  
  const incompleteSteps = steps.filter(step => !isStepCompleted(step.id, progress));
  if (incompleteSteps.length === 0) return null;
  
  const matchingStep = steps.find(step => 
    step.route === pathname && !isStepCompleted(step.id, progress)
  );
  
  return matchingStep || null;
};

export const isOnboardingActive = (
  dontShowAgain: boolean,
  steps: any[],
  progress: OnboardingProgress[]
) => {
  return !dontShowAgain && 
    steps.some(step => !isStepCompleted(step.id, progress) && step.id !== 'welcome' && step.id !== 'complete');
};
