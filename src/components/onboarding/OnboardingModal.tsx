
import React from 'react';
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { useOnboarding } from './useOnboarding';
import { onboardingStyles } from './TargetElementHighlighter';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingProgressIndicator from './OnboardingProgressIndicator';
import OnboardingStepContent from './OnboardingStepContent';
import OnboardingNavigation from './OnboardingNavigation';
import OnboardingSettings from './OnboardingSettings';

export const OnboardingModal = () => {
  const { loading } = useAuth();
  const {
    open,
    setOpen,
    dontShowAgain,
    setDontShowAgain,
    currentStep,
    currentStepData,
    totalSteps,
    nextStep,
    prevStep,
    handleDismiss
  } = useOnboarding();

  // Don't render anything if still loading auth state
  if (loading) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-primary/20 border-0">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
            
            {/* Content container */}
            <div className="p-6 relative z-10">
              <OnboardingProgressIndicator 
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
              
              <div className="space-y-6">
                <OnboardingStepContent 
                  step={currentStepData}
                  currentStep={currentStep}
                />
                
                <OnboardingSettings 
                  dontShowAgain={dontShowAgain}
                  setDontShowAgain={setDontShowAgain}
                  isVisible={currentStep === totalSteps - 1}
                />
                
                <OnboardingNavigation 
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={nextStep}
                  onPrev={prevStep}
                  onDismiss={handleDismiss}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add the global styles */}
      <style dangerouslySetInnerHTML={{ __html: onboardingStyles }} />
    </>
  );
};
