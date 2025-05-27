
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Skip, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useOnboarding } from './useOnboarding';
import { OnboardingStepIndicator } from './OnboardingStepIndicator';
import { OnboardingContent } from './OnboardingContent';

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
          <div className="h-1 bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/80"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToStep(0)}
                className="text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-500">
                {currentStepIndex + 1} de {steps.length}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTutorial}
                className="text-gray-500 hover:text-gray-700"
              >
                <Skip className="w-4 h-4 mr-1" />
                Pular
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeTutorial}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <OnboardingStepIndicator 
              steps={steps}
              currentStepIndex={currentStepIndex}
            />
            
            <OnboardingContent
              step={currentStep}
              onAction={nextStep}
              isLastStep={isLastStep}
            />

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
              {currentStepIndex > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => goToStep(currentStepIndex - 1)}
                  className="text-gray-600"
                >
                  Anterior
                </Button>
              ) : <div />}

              {!currentStep.route && !isLastStep && (
                <Button onClick={nextStep} className="bg-primary text-white">
                  Próximo
                </Button>
              )}

              {isLastStep && (
                <Button onClick={closeTutorial} className="bg-green-600 text-white">
                  Finalizar
                </Button>
              )}
            </div>

            {/* Don't show again option */}
            {isLastStep && (
              <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                <Checkbox
                  id="dontShow"
                  checked={dontShowAgain}
                  onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                />
                <label htmlFor="dontShow" className="text-sm text-gray-600 cursor-pointer">
                  Não mostrar este tutorial novamente
                </label>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
