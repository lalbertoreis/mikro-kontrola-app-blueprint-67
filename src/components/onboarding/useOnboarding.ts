
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingState, OnboardingStep } from './types';
import { ONBOARDING_STEPS, STORAGE_KEY } from './data';

export const useOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  
  const [state, setState] = useState<OnboardingState>({
    isOpen: false,
    currentStepIndex: 0,
    steps: ONBOARDING_STEPS,
    canSkip: true,
    dontShowAgain: false
  });

  // Load saved state from localStorage
  useEffect(() => {
    if (!user || loading) return;

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.dontShowAgain) {
          return; // Don't show onboarding if user chose not to see it again
        }
        setState(prev => ({
          ...prev,
          currentStepIndex: parsed.currentStepIndex || 0,
          steps: parsed.steps || ONBOARDING_STEPS,
          dontShowAgain: parsed.dontShowAgain || false
        }));
      } catch (error) {
        console.error('Error parsing onboarding state:', error);
      }
    }

    // Show onboarding for new users
    setState(prev => ({ ...prev, isOpen: true }));
  }, [user, loading]);

  // Save state to localStorage
  const saveState = (newState: Partial<OnboardingState>) => {
    const updatedState = { ...state, ...newState };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentStepIndex: updatedState.currentStepIndex,
      steps: updatedState.steps,
      dontShowAgain: updatedState.dontShowAgain
    }));
    setState(updatedState);
  };

  const nextStep = () => {
    const currentStep = state.steps[state.currentStepIndex];
    
    if (currentStep.route) {
      navigate(currentStep.route);
      // Mark current step as completed and move to next
      const updatedSteps = [...state.steps];
      updatedSteps[state.currentStepIndex].completed = true;
      
      const nextIndex = state.currentStepIndex + 1;
      saveState({
        currentStepIndex: nextIndex,
        steps: updatedSteps
      });
    } else {
      // Just move to next step
      const nextIndex = state.currentStepIndex + 1;
      if (nextIndex < state.steps.length) {
        saveState({ currentStepIndex: nextIndex });
      }
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      saveState({ currentStepIndex: stepIndex });
    }
  };

  const skipTutorial = () => {
    saveState({
      isOpen: false,
      currentStepIndex: state.steps.length - 1,
      dontShowAgain: true
    });
  };

  const closeTutorial = () => {
    if (state.dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        dontShowAgain: true
      }));
    }
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const setDontShowAgain = (value: boolean) => {
    setState(prev => ({ ...prev, dontShowAgain: value }));
  };

  return {
    isOpen: state.isOpen,
    currentStep: state.steps[state.currentStepIndex],
    currentStepIndex: state.currentStepIndex,
    steps: state.steps,
    dontShowAgain: state.dontShowAgain,
    setDontShowAgain,
    nextStep,
    goToStep,
    skipTutorial,
    closeTutorial
  };
};
