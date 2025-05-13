
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { highlightTargetElement } from './TargetElementHighlighter';
import { onboardingSteps, LOCAL_STORAGE_KEY } from './steps/OnboardingSteps';

export const useOnboarding = () => {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has already dismissed the onboarding
    const dismissed = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    }
    setOpen(false);
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStepIdx = currentStep + 1;
      const nextStepData = onboardingSteps[nextStepIdx];
      
      if (nextStepData.requiresClick && nextStepData.targetSelector) {
        // For steps requiring click, highlight the element and set up click handler
        highlightTargetElement(
          nextStepData.targetSelector, 
          nextStepIdx, 
          onboardingSteps, 
          navigate,
          setCurrentStep
        );
      } else {
        // For steps not requiring click, advance to next step
        setCurrentStep(prevStep => prevStep + 1);
      }
    } else {
      // If we're on the last step, dismiss the modal
      handleDismiss();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  // On mount and when step changes, check if we need to highlight an element
  useEffect(() => {
    const currentStepData = onboardingSteps[currentStep];
    if (currentStepData && currentStepData.requiresClick && currentStepData.targetSelector) {
      // Short delay to ensure the DOM is ready
      const timer = setTimeout(() => {
        const cleanup = highlightTargetElement(
          currentStepData.targetSelector, 
          currentStep, 
          onboardingSteps, 
          navigate,
          setCurrentStep
        );
        return cleanup;
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // Cleanup function to remove any highlights when component unmounts or step changes
    return () => {
      const existingHighlight = document.querySelector('.onboarding-highlight');
      if (existingHighlight) {
        existingHighlight.remove();
      }
    };
  }, [currentStep, navigate]);

  return {
    open,
    setOpen,
    dontShowAgain,
    setDontShowAgain,
    currentStep,
    currentStepData: onboardingSteps[currentStep],
    totalSteps: onboardingSteps.length,
    nextStep,
    prevStep,
    handleDismiss
  };
};
