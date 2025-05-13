
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import OnboardingContent from './OnboardingContent';
import { useOnboarding } from './useOnboarding';
import { onboardingStyles } from './TargetElementHighlighter';

export const OnboardingModal = () => {
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{currentStepData.title}</DialogTitle>
            <DialogDescription className="text-base">
              {currentStepData.description}
            </DialogDescription>
          </DialogHeader>

          <OnboardingContent
            currentStep={currentStepData}
            currentStepIndex={currentStep}
            totalSteps={totalSteps}
            dontShowAgain={dontShowAgain}
            setDontShowAgain={setDontShowAgain}
            onNext={nextStep}
            onPrev={prevStep}
            onDismiss={handleDismiss}
          />
          
          <DialogFooter />
        </DialogContent>
      </Dialog>
      
      {/* Add the global styles */}
      <style dangerouslySetInnerHTML={{ __html: onboardingStyles }} />
    </>
  );
};
