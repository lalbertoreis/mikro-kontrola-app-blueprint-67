
import { useState } from 'react';
import { useOnboardingData } from './useOnboardingData';
import { useOnboardingActions } from './useOnboardingActions';
import { useOnboardingAutoDetection } from './useOnboardingAutoDetection';

export const useOnboardingProgress = () => {
  const [wasRecentlyReset, setWasRecentlyReset] = useState(false);
  
  const {
    progress,
    setProgress,
    settings,
    setSettings,
    isLoading,
    loadProgress
  } = useOnboardingData();

  const {
    markStepCompleted,
    updateSettings,
    resetOnboarding
  } = useOnboardingActions({
    progress,
    setProgress,
    settings,
    setSettings,
    setWasRecentlyReset
  });

  const {
    detectAndMarkCompletedSteps
  } = useOnboardingAutoDetection({
    progress,
    isLoading,
    wasRecentlyReset,
    markStepCompleted
  });

  return {
    progress,
    settings,
    isLoading,
    markStepCompleted,
    updateSettings,
    resetOnboarding,
    loadProgress,
    detectAndMarkCompletedSteps
  };
};
