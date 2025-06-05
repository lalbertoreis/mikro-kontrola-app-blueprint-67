
import { useNavigate } from 'react-router-dom';
import { OnboardingSettings } from '@/types/onboarding';
import { OnboardingState } from './types';
import { getNextIncompleteStepIndex } from './onboardingHelpers';

export const useOnboardingNavigation = (
  state: OnboardingState,
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  updateSettings: (settings: Partial<OnboardingSettings>) => Promise<void>,
  setHasNavigatedFromModal: (value: boolean) => void
) => {
  const navigate = useNavigate();

  const nextStep = () => {
    const currentStep = state.steps[state.currentStepIndex];
    
    console.log('NextStep called - current step:', currentStep);
    
    if (currentStep.route) {
      console.log('Current step has route, navigating to:', currentStep.route);
      setHasNavigatedFromModal(true);
      navigate(currentStep.route);
      setState(prev => ({ ...prev, isOpen: false }));
    } else {
      const nextIndex = getNextIncompleteStepIndex([]);
      
      if (nextIndex < state.steps.length) {
        const nextStep = state.steps[nextIndex];
        
        console.log('Moving to next step:', nextStep);
        
        setState(prev => ({ ...prev, currentStepIndex: nextIndex }));
        updateSettings({ current_step_index: nextIndex });
        
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
      }
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      setState(prev => ({ ...prev, currentStepIndex: stepIndex }));
      updateSettings({ current_step_index: stepIndex });
    }
  };

  const skipTutorial = () => {
    setState(prev => ({ ...prev, isOpen: false, dontShowAgain: true }));
    updateSettings({ 
      dont_show_again: true, 
      is_completed: true,
      current_step_index: state.steps.length - 1 
    });
  };

  const closeTutorial = () => {
    setState(prev => ({ ...prev, isOpen: false }));
    
    if (state.currentStepIndex === state.steps.length - 1) {
      updateSettings({ is_completed: true });
    }
    
    if (state.dontShowAgain) {
      updateSettings({ dont_show_again: true });
    }
  };

  const setDontShowAgain = (value: boolean) => {
    setState(prev => ({ ...prev, dontShowAgain: value }));
  };

  const reopenModal = () => {
    setHasNavigatedFromModal(false);
    setState(prev => ({ ...prev, isOpen: true }));
  };

  const advanceOnboarding = async () => {
    console.log('Advancing onboarding programmatically');
    
    const nextIndex = getNextIncompleteStepIndex([]);
    
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
      setState(prev => ({ ...prev, isOpen: true }));
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
