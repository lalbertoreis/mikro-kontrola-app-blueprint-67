
import { useNavigate } from 'react-router-dom';
import { OnboardingSettings } from '@/types/onboarding';
import { OnboardingState } from './types';
import { getNextIncompleteStepIndex } from './onboardingHelpers';

export const useOnboardingNavigation = (
  state: OnboardingState,
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  updateSettings: (settings: Partial<OnboardingSettings>) => Promise<void>,
  setHasNavigatedFromModal: (value: boolean) => void,
  progress: any[],
  markStepCompleted: (stepId: string) => Promise<void>
) => {
  const navigate = useNavigate();

  const nextStep = async () => {
    const currentStep = state.steps[state.currentStepIndex];
    
    console.log('NextStep called - current step:', currentStep, 'currentIndex:', state.currentStepIndex);
    
    // FLUXO SIMPLIFICADO: Se tem rota, executar ações e navegar
    if (currentStep.route) {
      console.log('Step has route - completing and navigating to:', currentStep.route);
      
      // 1. Marcar step como completo
      await markStepCompleted(currentStep.id);
      
      // 2. Calcular próximo índice
      const nextIndex = state.currentStepIndex + 1;
      
      // 3. Atualizar banco
      await updateSettings({ current_step_index: nextIndex });
      
      // 4. IMPORTANTE: Marcar flag ANTES de fechar modal
      setHasNavigatedFromModal(true);
      
      // 5. Fechar modal
      setState(prev => ({ 
        ...prev, 
        currentStepIndex: nextIndex, 
        isOpen: false 
      }));
      
      // 6. Navegar
      navigate(currentStep.route);
      return;
    }

    // Se não tem rota, apenas avançar no modal
    const nextIndex = state.currentStepIndex + 1;
    
    if (nextIndex < state.steps.length) {
      console.log('Moving to next step index:', nextIndex);
      await updateSettings({ current_step_index: nextIndex });
      setState(prev => ({ ...prev, currentStepIndex: nextIndex }));
    }
  };

  const goToStep = async (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      console.log('Going to step index:', stepIndex);
      await updateSettings({ current_step_index: stepIndex });
      setState(prev => ({ ...prev, currentStepIndex: stepIndex }));
    }
  };

  const skipTutorial = async () => {
    setState(prev => ({ ...prev, isOpen: false, dontShowAgain: true }));
    await updateSettings({ 
      dont_show_again: true, 
      is_completed: true,
      current_step_index: state.steps.length - 1 
    });
  };

  const closeTutorial = async () => {
    setState(prev => ({ ...prev, isOpen: false }));
    
    if (state.currentStepIndex === state.steps.length - 1) {
      await updateSettings({ is_completed: true });
    }
    
    if (state.dontShowAgain) {
      await updateSettings({ dont_show_again: true });
    }
  };

  const setDontShowAgain = (value: boolean) => {
    setState(prev => ({ ...prev, dontShowAgain: value }));
  };

  const reopenModal = () => {
    console.log('Reopening modal manually');
    setHasNavigatedFromModal(false);
    setState(prev => ({ ...prev, isOpen: true }));
  };

  const advanceOnboarding = async () => {
    console.log('Advancing onboarding programmatically');
    
    const nextIndex = getNextIncompleteStepIndex(progress, state.steps);
    
    if (nextIndex < state.steps.length) {
      console.log('Moving to next step index:', nextIndex);
      
      await updateSettings({ current_step_index: nextIndex });
      setState(prev => ({ ...prev, currentStepIndex: nextIndex }));
      
      const nextStep = state.steps[nextIndex];
      
      if (nextStep.route) {
        console.log('Next step has route, navigating to:', nextStep.route);
        setHasNavigatedFromModal(true);
        navigate(nextStep.route);
        setState(prev => ({ ...prev, isOpen: false }));
      } else {
        console.log('Next step has no route, opening modal');
        setHasNavigatedFromModal(false);
        setState(prev => ({ ...prev, isOpen: true }));
      }
    } else {
      console.log('Onboarding completed!');
      await updateSettings({ is_completed: true });
      setState(prev => ({ ...prev, isOpen: false }));
    }
  };

  return {
    nextStep,
    goToStep,
    skipTutorial,
    closeTutorial,
    setDontShowAgain,
    reopenModal,
    advanceOnboarding
  };
};
