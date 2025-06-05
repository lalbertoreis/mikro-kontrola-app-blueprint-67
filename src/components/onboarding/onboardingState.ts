
import { useState } from 'react';
import { OnboardingState } from './types';
import { ONBOARDING_STEPS } from './data';

export const useOnboardingState = () => {
  const [state, setState] = useState<OnboardingState>({
    isOpen: false,
    currentStepIndex: 0,
    steps: ONBOARDING_STEPS,
    canSkip: true,
    dontShowAgain: false
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRunInitialDetection, setHasRunInitialDetection] = useState(false);
  const [hasNavigatedFromModal, setHasNavigatedFromModal] = useState(false);

  return {
    state,
    setState,
    isInitialized,
    setIsInitialized,
    hasRunInitialDetection,
    setHasRunInitialDetection,
    hasNavigatedFromModal,
    setHasNavigatedFromModal
  };
};
