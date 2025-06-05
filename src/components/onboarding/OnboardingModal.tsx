
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from './useOnboarding';
import { OnboardingStepIndicator } from './OnboardingStepIndicator';
import { OnboardingModalHeader } from './OnboardingModalHeader';
import { OnboardingModalContent } from './OnboardingModalContent';
import { OnboardingModalNavigation } from './OnboardingModalNavigation';
import { OnboardingModalCheckbox } from './OnboardingModalCheckbox';

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
    goToStep,
    resetOnboarding
  } = useOnboarding();

  if (!isOpen || !currentStep) return null;

  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

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
          <OnboardingModalHeader
            progress={progress}
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
            onReset={resetOnboarding}
            onSkip={skipTutorial}
            onClose={closeTutorial}
          />

          {/* Content */}
          <div className="p-6">
            <OnboardingStepIndicator
              steps={steps}
              currentStepIndex={currentStepIndex}
            />
            
            <OnboardingModalContent
              currentStep={currentStep}
              currentStepIndex={currentStepIndex}
              isLastStep={isLastStep}
              onNext={nextStep}
            />

            <OnboardingModalNavigation
              currentStepIndex={currentStepIndex}
              currentStep={currentStep}
              isLastStep={isLastStep}
              onPrevious={() => goToStep(currentStepIndex - 1)}
              onNext={nextStep}
              onFinish={closeTutorial}
            />

            {isLastStep && (
              <OnboardingModalCheckbox
                dontShowAgain={dontShowAgain}
                onDontShowAgainChange={setDontShowAgain}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
