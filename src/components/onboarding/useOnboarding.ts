
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/hooks/useServices';
import { useEmployees } from '@/hooks/useEmployees';
import { OnboardingState, OnboardingStep } from './types';
import { ONBOARDING_STEPS, STORAGE_KEY } from './data';

export const useOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { services } = useServices();
  const { employees } = useEmployees();
  
  const [state, setState] = useState<OnboardingState>({
    isOpen: false,
    currentStepIndex: 0,
    steps: ONBOARDING_STEPS,
    canSkip: true,
    dontShowAgain: false
  });

  // Check if steps are completed based on actual data
  const checkStepCompletion = () => {
    if (!user) return;

    const updatedSteps = [...state.steps];
    let hasChanges = false;
    let shouldAdvance = false;

    // Check services step
    const servicesStep = updatedSteps.find(step => step.id === 'services');
    if (servicesStep && !servicesStep.completed && services.length > 0) {
      servicesStep.completed = true;
      hasChanges = true;
      
      // If we're currently on the services step, advance to next
      if (state.currentStepIndex === updatedSteps.findIndex(step => step.id === 'services')) {
        shouldAdvance = true;
      }
    }

    // Check employees step
    const employeesStep = updatedSteps.find(step => step.id === 'employees');
    if (employeesStep && !employeesStep.completed && employees.length > 0) {
      employeesStep.completed = true;
      hasChanges = true;
      
      // If we're currently on the employees step, advance to next
      if (state.currentStepIndex === updatedSteps.findIndex(step => step.id === 'employees')) {
        shouldAdvance = true;
      }
    }

    if (hasChanges) {
      const newState = { ...state, steps: updatedSteps };
      
      if (shouldAdvance) {
        // Find next incomplete step
        const nextIncompleteIndex = updatedSteps.findIndex((step, index) => 
          index > state.currentStepIndex && !step.completed
        );
        
        if (nextIncompleteIndex !== -1) {
          newState.currentStepIndex = nextIncompleteIndex;
          newState.isOpen = true; // Reopen modal to show next step
        } else {
          // All steps completed
          newState.currentStepIndex = updatedSteps.length - 1;
          newState.isOpen = true;
        }
      }
      
      saveState(newState);
      setState(newState);
    }
  };

  // Load saved state from localStorage
  useEffect(() => {
    if (!user || loading) return;

    const savedState = localStorage.getItem(STORAGE_KEY);
    let initialState = {
      isOpen: true,
      currentStepIndex: 0,
      steps: ONBOARDING_STEPS,
      canSkip: true,
      dontShowAgain: false
    };

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.dontShowAgain) {
          return; // Don't show onboarding if user chose not to see it again
        }
        initialState = {
          ...initialState,
          currentStepIndex: parsed.currentStepIndex || 0,
          steps: parsed.steps || ONBOARDING_STEPS,
          dontShowAgain: parsed.dontShowAgain || false
        };
      } catch (error) {
        console.error('Error parsing onboarding state:', error);
      }
    }

    // Find first incomplete step to resume from
    const firstIncompleteIndex = initialState.steps.findIndex(step => !step.completed);
    if (firstIncompleteIndex !== -1 && firstIncompleteIndex !== initialState.steps.length - 1) {
      initialState.currentStepIndex = firstIncompleteIndex;
    }

    setState(initialState);
  }, [user, loading]);

  // Check completion whenever services or employees change
  useEffect(() => {
    if (user && !loading && state.isOpen) {
      checkStepCompletion();
    }
  }, [services, employees, user, loading]);

  // Save state to localStorage
  const saveState = (newState: Partial<OnboardingState>) => {
    const updatedState = { ...state, ...newState };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentStepIndex: updatedState.currentStepIndex,
      steps: updatedState.steps,
      dontShowAgain: updatedState.dontShowAgain
    }));
  };

  const nextStep = () => {
    const currentStep = state.steps[state.currentStepIndex];
    
    if (currentStep.route) {
      // Navigate to the step's route
      navigate(currentStep.route);
      
      // Close modal temporarily while user completes the task
      setState(prev => ({ ...prev, isOpen: false }));
      
      // The step completion will be detected by the useEffect above
      // and will automatically advance and reopen the modal
    } else {
      // Just move to next step for steps without routes
      const nextIndex = state.currentStepIndex + 1;
      if (nextIndex < state.steps.length) {
        const newState = { ...state, currentStepIndex: nextIndex };
        saveState(newState);
        setState(newState);
      }
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      const newState = { ...state, currentStepIndex: stepIndex };
      saveState(newState);
      setState(newState);
    }
  };

  const skipTutorial = () => {
    const newState = {
      ...state,
      isOpen: false,
      currentStepIndex: state.steps.length - 1,
      dontShowAgain: true
    };
    saveState(newState);
    setState(newState);
  };

  const closeTutorial = () => {
    if (state.dontShowAgain) {
      const newState = { ...state, dontShowAgain: true };
      saveState(newState);
    }
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const setDontShowAgain = (value: boolean) => {
    setState(prev => ({ ...prev, dontShowAgain: value }));
  };

  // Helper function to get current step for current page
  const getCurrentStepForPage = () => {
    const currentPath = location.pathname;
    
    // Check if we're in onboarding mode (not dontShowAgain and has incomplete steps)
    if (state.dontShowAgain) return null;
    
    const incompleteSteps = state.steps.filter(step => !step.completed);
    if (incompleteSteps.length === 0) return null;
    
    // Find step that matches current route
    return state.steps.find(step => step.route === currentPath && !step.completed);
  };

  // Check if onboarding is active (has incomplete steps and user hasn't opted out)
  const isOnboardingActive = !state.dontShowAgain && 
    state.steps.some(step => !step.completed && step.id !== 'welcome' && step.id !== 'complete');

  return {
    isOpen: state.isOpen,
    currentStep: state.steps[state.currentStepIndex],
    currentStepIndex: state.currentStepIndex,
    steps: state.steps,
    dontShowAgain: state.dontShowAgain,
    isOnboardingActive,
    getCurrentStepForPage,
    setDontShowAgain,
    nextStep,
    goToStep,
    skipTutorial,
    closeTutorial
  };
};
