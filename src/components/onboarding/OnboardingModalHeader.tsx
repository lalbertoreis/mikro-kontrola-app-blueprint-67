
import React from 'react';
import { motion } from 'framer-motion';
import { X, SkipForward, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingModalHeaderProps {
  progress: number;
  currentStepIndex: number;
  totalSteps: number;
  onReset: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const OnboardingModalHeader: React.FC<OnboardingModalHeaderProps> = ({
  progress,
  currentStepIndex,
  totalSteps,
  onReset,
  onSkip,
  onClose
}) => {
  return (
    <>
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
            onClick={onReset}
            className="text-gray-500 hover:text-gray-700"
            title="Reiniciar tutorial"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-500">
            {currentStepIndex + 1} de {totalSteps}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            <SkipForward className="w-4 h-4 mr-1" />
            Pular
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
