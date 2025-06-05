
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
  // Mostrar apenas 5 passos por vez para não sobrecarregar o usuário
  const maxVisibleSteps = 5;
  
  // Calcular qual faixa de passos mostrar
  const startIndex = Math.max(0, Math.min(currentStepIndex - 2, steps.length - maxVisibleSteps));
  const endIndex = Math.min(startIndex + maxVisibleSteps, steps.length);
  const visibleSteps = steps.slice(startIndex, endIndex);
  
  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {/* Indicador de passos anteriores se houver */}
      {startIndex > 0 && (
        <div className="text-xs text-gray-400 mr-2">...</div>
      )}
      
      {visibleSteps.map((step, index) => {
        const actualIndex = startIndex + index;
        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : actualIndex === currentStepIndex
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
              animate={{
                scale: actualIndex === currentStepIndex ? 1.1 : 1,
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
      
      {/* Indicador de passos posteriores se houver */}
      {endIndex < steps.length && (
        <div className="text-xs text-gray-400 ml-2">...</div>
      )}
    </div>
  );
};
