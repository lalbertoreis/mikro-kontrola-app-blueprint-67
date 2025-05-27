
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { OnboardingStep } from './types';

interface OnboardingContentProps {
  step: OnboardingStep;
  onAction: () => void;
  isLastStep: boolean;
}

export const OnboardingContent: React.FC<OnboardingContentProps> = ({
  step,
  onAction,
  isLastStep
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        {step.title}
      </h2>
      
      <p className="text-lg text-gray-600 mb-4">
        {step.description}
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-gray-700">
          {step.content}
        </p>
      </div>

      {step.route && !isLastStep && (
        <Button 
          onClick={onAction}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          LET'S GO!
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </motion.div>
  );
};
