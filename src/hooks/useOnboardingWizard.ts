
import { useState, useEffect } from 'react';
import { OnboardingState } from './onboarding/types';
import { ONBOARDING_STEPS } from './onboarding/constants';
import { loadOnboardingState } from './onboarding/storage';
import { useOnboardingActions } from './onboarding/useOnboardingActions';

export type { OnboardingStep } from './onboarding/types';

export const useOnboardingWizard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    isCompleted: false,
    isSkipped: false,
    isVisible: true
  });

  // Carregar estado do localStorage
  useEffect(() => {
    const savedState = loadOnboardingState();
    console.log('Loaded onboarding state:', savedState);
    
    if (savedState) {
      setState(savedState);
      // Só abrir se não foi completado nem pulado e está marcado como visível
      if (!savedState.isCompleted && !savedState.isSkipped && savedState.isVisible === true) {
        setIsOpen(true);
      }
    } else {
      // Primeira vez - mostrar onboarding
      console.log('First time - showing onboarding');
      setIsOpen(true);
    }
  }, []);

  const updateState = (newState: Partial<OnboardingState>) => {
    setState(current => ({ ...current, ...newState }));
  };

  const actions = useOnboardingActions(state, updateState, setIsOpen);

  // Lógica para mostrar o botão de retomar
  // Só mostrar se: não foi completado, não foi pulado, não está visível e o modal não está aberto
  const shouldShowResumeButton = !state.isCompleted && !state.isSkipped && state.isVisible === false && !isOpen;

  console.log('Onboarding state debug:', {
    isCompleted: state.isCompleted,
    isSkipped: state.isSkipped,
    isVisible: state.isVisible,
    isOpen,
    shouldShowResumeButton
  });

  return {
    // Estado
    isOpen,
    currentStep: state.currentStep,
    currentStepData: ONBOARDING_STEPS[state.currentStep],
    totalSteps: ONBOARDING_STEPS.length,
    isCompleted: state.isCompleted,
    isSkipped: state.isSkipped,
    isVisible: state.isVisible,
    steps: ONBOARDING_STEPS,
    shouldShowResumeButton,
    
    // Ações
    ...actions,
    
    // Helpers
    isFirstStep: state.currentStep === 0,
    isLastStep: state.currentStep === ONBOARDING_STEPS.length - 1,
    progress: ((state.currentStep + 1) / ONBOARDING_STEPS.length) * 100
  };
};
