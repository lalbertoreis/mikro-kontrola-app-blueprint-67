
import { OnboardingProgress } from '@/types/onboarding';
import { ONBOARDING_STEPS } from './data';

export const isStepCompleted = (stepId: string, progress: OnboardingProgress[]) => {
  const stepProgress = progress.find(p => p.step_id === stepId);
  return stepProgress?.completed || false;
};

export const getNextIncompleteStepIndex = (progress: OnboardingProgress[], steps: any[] = ONBOARDING_STEPS) => {
  const incompleteStepIndex = steps.findIndex(step => !isStepCompleted(step.id, progress));
  return incompleteStepIndex >= 0 ? incompleteStepIndex : steps.length - 1;
};

export const getCurrentStepForPage = (
  pathname: string,
  steps: any[],
  progress: OnboardingProgress[],
  dontShowAgain: boolean,
  isInitialized: boolean
) => {
  console.log('getCurrentStepForPage called:', { pathname, dontShowAgain, isInitialized });
  
  if (dontShowAgain || !isInitialized) {
    console.log('Not showing step - dontShowAgain or not initialized');
    return null;
  }
  
  // Encontrar o step que corresponde à página atual
  const stepForPage = steps.find(step => step.route === pathname);
  
  if (!stepForPage) {
    console.log('No step found for current page');
    return null;
  }
  
  // Verificar se o step está completo
  const isCompleted = isStepCompleted(stepForPage.id, progress);
  console.log('Step for page:', stepForPage.id, 'completed:', isCompleted);
  
  // Retornar o step apenas se NÃO estiver completo
  return isCompleted ? null : stepForPage;
};

export const isOnboardingActive = (
  dontShowAgain: boolean,
  steps: any[],
  progress: OnboardingProgress[]
) => {
  const active = !dontShowAgain && 
    steps.some(step => !isStepCompleted(step.id, progress) && step.id !== 'welcome' && step.id !== 'complete');
  
  console.log('isOnboardingActive:', active);
  return active;
};
