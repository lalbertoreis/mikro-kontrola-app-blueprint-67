
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from './useOnboarding';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingStepIndicator } from './OnboardingStepIndicator';
import { OnboardingContent } from './OnboardingContent';
import { OnboardingNavigation } from './OnboardingNavigation';

export const OnboardingModal: React.FC = () => {
  const {
    isOpen,
    currentStep,
    currentStepIndex,
    steps,
    dontShowAgain,
    setDontShowAgain,
    nextStep,
    skipTutorial,
    closeTutorial,
    goToStep
  } = useOnboarding();

  if (!isOpen || !currentStep) return null;

  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handlePrevious = () => {
    goToStep(currentStepIndex - 1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeTutorial}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        >
          {/* Progress bar */}
          <OnboardingProgressBar progress={progress} />

          {/* Header */}
          <OnboardingHeader
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
            onRestart={() => goToStep(0)}
            onSkip={skipTutorial}
            onClose={closeTutorial}
          />

          {/* Content */}
          <div className="p-6">
            {/* Step Indicator */}
            <OnboardingStepIndicator
              steps={steps}
              currentStepIndex={currentStepIndex}
            />
            
            {/* Step Content */}
            <OnboardingContent
              step={currentStep}
              onAction={nextStep}
              isLastStep={isLastStep}
            />

            {/* Navigation */}
            <OnboardingNavigation
              currentStep={currentStep}
              currentStepIndex={currentStepIndex}
              isLastStep={isLastStep}
              dontShowAgain={dontShowAgain}
              onPrevious={handlePrevious}
              onNext={nextStep}
              onFinish={closeTutorial}
              onDontShowAgainChange={setDontShowAgain}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
