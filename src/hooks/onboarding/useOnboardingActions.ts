
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateGlobalState } from './useOnboardingState';
import { ONBOARDING_STEPS } from '@/data/onboardingSteps';

export const useOnboardingActions = () => {
  const navigate = useNavigate();

  const nextStep = useCallback((currentStep: number) => {
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < ONBOARDING_STEPS.length) {
      updateGlobalState({ currentStep: nextStepIndex });
    } else {
      completeOnboarding();
    }
  }, []);

  const previousStep = useCallback((currentStep: number) => {
    const prevStepIndex = currentStep - 1;
    if (prevStepIndex >= 0) {
      updateGlobalState({ currentStep: prevStepIndex });
    }
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
      updateGlobalState({ currentStep: stepIndex });
    }
  }, []);

  const skipOnboarding = useCallback(() => {
    console.log('=== PULANDO ONBOARDING ===');
    updateGlobalState({ 
      isSkipped: true, 
      isWizardVisible: false 
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    console.log('=== COMPLETANDO ONBOARDING ===');
    updateGlobalState({ 
      isCompleted: true, 
      isWizardVisible: false 
    });
  }, []);

  const resetOnboarding = useCallback(() => {
    console.log('=== RESETANDO ONBOARDING ===');
    const resetState = {
      currentStep: 0,
      isCompleted: false,
      isSkipped: false,
      isWizardVisible: true
    };
    updateGlobalState(resetState);
  }, []);

  const hideWizard = useCallback(() => {
    console.log('=== ESCONDENDO WIZARD ===');
    updateGlobalState({ isWizardVisible: false });
  }, []);

  const showWizard = useCallback(() => {
    console.log('=== MOSTRANDO WIZARD ===');
    updateGlobalState({ isWizardVisible: true });
  }, []);

  const closeModal = useCallback(() => {
    hideWizard();
  }, [hideWizard]);

  const navigateAndHideWizard = useCallback((path: string) => {
    console.log('=== AÇÃO: navigateAndHideWizard ===');
    console.log('Caminho:', path);
    
    // Esconder wizard IMEDIATAMENTE e de forma síncrona
    hideWizard();
    
    // Navegar imediatamente após esconder
    console.log('Navegando para:', path);
    navigate(path);
  }, [hideWizard, navigate]);

  return {
    nextStep,
    previousStep,
    goToStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    closeModal,
    hideWizard,
    showWizard,
    navigateAndHideWizard
  };
};
