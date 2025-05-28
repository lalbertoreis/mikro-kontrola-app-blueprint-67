
import React from 'react';
import { X, SkipForward, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingHeaderProps {
  currentStepIndex: number;
  totalSteps: number;
  onRestart: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  currentStepIndex,
  totalSteps,
  onRestart,
  onSkip,
  onClose
}) => {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRestart}
          className="text-gray-500 hover:text-gray-700"
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
  );
};
