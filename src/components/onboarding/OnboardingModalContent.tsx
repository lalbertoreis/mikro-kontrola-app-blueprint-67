
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { OnboardingStep } from './types';

interface OnboardingModalContentProps {
  currentStep: OnboardingStep;
  currentStepIndex: number;
  isLastStep: boolean;
  onNext: () => void;
}

export const OnboardingModalContent: React.FC<OnboardingModalContentProps> = ({
  currentStep,
  currentStepIndex,
  isLastStep,
  onNext
}) => {
  return (
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

      {currentStep.route && (
        <Button 
          onClick={onNext}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          VAMOS LÁ!
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </motion.div>
  );
};
