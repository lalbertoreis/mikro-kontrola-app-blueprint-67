
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
  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
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
              backgroundColor: index < currentStepIndex 
                ? '#10b981' 
                : index === currentStepIndex
                ? 'var(--primary)'
                : '#e5e7eb'
            }}
            transition={{ duration: 0.3 }}
          >
            {index < currentStepIndex ? (
              <Check className="w-4 h-4" />
            ) : (
              index + 1
            )}
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
  );
};
