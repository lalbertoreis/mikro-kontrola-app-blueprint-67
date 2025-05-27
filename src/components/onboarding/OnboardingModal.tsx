
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SkipForward, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useOnboarding } from './useOnboarding';

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
                <SkipForward className="w-4 h-4 mr-1" />
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
            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              {steps.map((_, index) => (
                <div key={index} className="flex items-center">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index < currentStepIndex 
                        ? 'bg-green-500 text-white' 
                        : index === currentStepIndex
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                    animate={{
                      scale: index === currentStepIndex ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {index < currentStepIndex ? '✓' : index + 1}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div 
                      className={`w-8 h-0.5 mx-1 ${
                        index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Step Content */}
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {currentStep.title}
              </h2>
              
              <p className="text-lg text-gray-600 mb-4">
                {currentStep.description}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  {currentStep.content}
                </p>
              </div>

              {currentStep.route && !isLastStep && (
                <Button 
                  onClick={nextStep}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  LET'S GO!
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </motion.div>

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
