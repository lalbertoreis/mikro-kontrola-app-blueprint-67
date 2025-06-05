
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { OnboardingStep } from './types';

interface OnboardingStepIndicatorProps {
  steps: OnboardingStep[];
  currentStepIndex: number;
}

export const OnboardingStepIndicator: React.FC<OnboardingStepIndicatorProps> = ({
  steps,
  currentStepIndex
}) => {
  // Mostrar apenas os steps até o atual + alguns à frente para dar contexto
  const maxStepsToShow = 3;
  
  // Calcular quantos steps já foram completados
  const completedStepsCount = steps.filter(step => step.completed).length;
  
  // Mostrar do primeiro step não completado até alguns à frente
  const firstIncompleteIndex = steps.findIndex(step => !step.completed);
  const startIndex = Math.max(0, firstIncompleteIndex);
  const endIndex = Math.min(startIndex + maxStepsToShow, steps.length);
  
  const visibleSteps = steps.slice(startIndex, endIndex);
  
  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {/* Mostrar indicador de steps anteriores completados se houver */}
      {startIndex > 0 && (
        <div className="flex items-center space-x-1 mr-2">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <div className="text-xs text-green-600 font-medium">+{startIndex}</div>
          <div className="text-xs text-gray-400">...</div>
        </div>
      )}
      
      {visibleSteps.map((step, index) => {
        const actualIndex = startIndex + index;
        const isCurrentStep = actualIndex === currentStepIndex;
        
        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : isCurrentStep
                  ? 'bg-primary text-white shadow-lg ring-2 ring-primary/30'
                  : 'bg-gray-200 text-gray-600'
              }`}
              animate={{
                scale: isCurrentStep ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {step.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                actualIndex + 1
              )}
            </motion.div>
            {index < visibleSteps.length - 1 && (
              <div 
                className={`w-8 h-0.5 mx-1 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
      
      {/* Mostrar indicador de steps posteriores se houver */}
      {endIndex < steps.length && (
        <div className="flex items-center space-x-1 ml-2">
          <div className="text-xs text-gray-400">...</div>
          <div className="text-xs text-gray-500">+{steps.length - endIndex}</div>
        </div>
      )}
    </div>
  );
};
