
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingStep } from './types';

interface OnboardingNavigationProps {
  currentStep: OnboardingStep;
  currentStepIndex: number;
  isLastStep: boolean;
  dontShowAgain: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  onDontShowAgainChange: (checked: boolean) => void;
}

export const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentStep,
  currentStepIndex,
  isLastStep,
  dontShowAgain,
  onPrevious,
  onNext,
  onFinish,
  onDontShowAgainChange
}) => {
  return (
    <>
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

        {/* Show "Próximo" for steps without routes and not last step */}
        {!currentStep.route && !isLastStep && (
          <Button onClick={onNext} className="bg-primary text-white">
            Próximo
          </Button>
        )}

        {/* Show "Finalizar" for last step */}
        {isLastStep && (
          <Button onClick={onFinish} className="bg-green-600 text-white">
            Finalizar
          </Button>
        )}
      </div>

      {/* Don't show again option */}
      {isLastStep && (
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
          <Checkbox
            id="dontShow"
            checked={dontShowAgain}
            onCheckedChange={(checked) => onDontShowAgainChange(checked === true)}
          />
          <label htmlFor="dontShow" className="text-sm text-gray-600 cursor-pointer">
            Não mostrar este tutorial novamente
          </label>
        </div>
      )}
    </>
  );
};
