
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { StepWelcome } from './steps/StepWelcome';
import { StepBusinessInfo } from './steps/StepBusinessInfo';
import { StepServices } from './steps/StepServices';
import { StepEmployees } from './steps/StepEmployees';
import { StepClients } from './steps/StepClients';
import { StepCalendar } from './steps/StepCalendar';
import { StepOnlineBooking } from './steps/StepOnlineBooking';
import { StepPaymentMethods } from './steps/StepPaymentMethods';
import { StepHolidays } from './steps/StepHolidays';
import { StepFinance } from './steps/StepFinance';
import { StepComplete } from './steps/StepComplete';

// Mapeamento dos componentes dos passos
const stepComponents: Record<string, React.ComponentType> = {
  'welcome': StepWelcome,
  'business-info': StepBusinessInfo,
  'services': StepServices,
  'employees': StepEmployees,
  'clients': StepClients,
  'calendar': StepCalendar,
  'online-booking': StepOnlineBooking,
  'payment-methods': StepPaymentMethods,
  'holidays': StepHolidays,
  'finance': StepFinance,
  'complete': StepComplete
};

// Componente genérico para passos sem componente específico
const GenericStep: React.FC<{ title: string; description: string; content: string }> = ({ 
  title, 
  description, 
  content 
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
    <p className="text-gray-700">{content}</p>
  </div>
);

export const OnboardingWizard: React.FC = () => {
  const {
    isOpen,
    currentStep,
    currentStepData,
    totalSteps,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    closeModal,
    isFirstStep,
    isLastStep,
    progress
  } = useOnboardingWizard();

  if (!isOpen || !currentStepData) return null;

  const StepComponent = stepComponents[currentStepData.id];

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding();
    } else {
      nextStep();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-3 pr-12">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">
                  Passo {currentStep + 1} de {totalSteps}
                </span>
                <button
                  onClick={skipOnboarding}
                  className="flex items-center space-x-1 text-sm hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Pular Tutorial</span>
                </button>
              </div>
              
              <Progress value={progress} className="bg-white/20" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {StepComponent ? (
                <StepComponent />
              ) : (
                <GenericStep
                  title={currentStepData.title}
                  description={currentStepData.description}
                  content={currentStepData.content}
                />
              )}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={isFirstStep}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>{isLastStep ? 'Finalizar' : 'Próximo'}</span>
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
