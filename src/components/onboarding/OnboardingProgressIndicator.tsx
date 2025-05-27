
import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgressIndicator: React.FC<OnboardingProgressIndicatorProps> = ({
  currentStep,
  totalSteps
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="text-sm text-muted-foreground">
        Passo {currentStep + 1} de {totalSteps}
      </div>
      <div className="flex space-x-1.5">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <motion.div
            key={idx}
            className={`h-1.5 rounded-full ${
              idx === currentStep ? "bg-primary w-6" : "bg-muted w-2"
            }`}
            animate={{ 
              backgroundColor: idx === currentStep ? "var(--primary)" : "var(--muted)",
              width: idx === currentStep ? 24 : 8
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingProgressIndicator;
