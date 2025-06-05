
import React from 'react';
import { Button } from '@/components/ui/button';
import { OnboardingStep } from './types';

interface OnboardingModalNavigationProps {
  currentStepIndex: number;
  currentStep: OnboardingStep;
  isLastStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export const OnboardingModalNavigation: React.FC<OnboardingModalNavigationProps> = ({
  currentStepIndex,
  currentStep,
  isLastStep,
  onPrevious,
  onNext,
  onFinish
}) => {
  return (
    <div className="flex justify-between items-center mt-6">
      {currentStepIndex > 0 ? (
        <Button
          variant="outline"
          onClick={onPrevious}
          className="text-gray-600"
        >
          Anterior
        </Button>
      ) : <div />}

      {!currentStep.route && !isLastStep && (
        <Button onClick={onNext} className="bg-primary text-white">
          Próximo
        </Button>
      )}

      {isLastStep && (
        <Button onClick={onFinish} className="bg-green-600 text-white">
          Finalizar
        </Button>
      )}
    </div>
  );
};
