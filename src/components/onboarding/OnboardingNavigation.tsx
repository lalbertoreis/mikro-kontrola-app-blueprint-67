
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onDismiss: () => void;
}

const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onDismiss
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between pt-6">
      {!isFirstStep ? (
        <Button variant="outline" onClick={onPrev} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> 
          Anterior
        </Button>
      ) : <div />}
      
      {isLastStep ? (
        <Button onClick={onDismiss} className="gap-2 bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="h-4 w-4" /> 
          Concluir
        </Button>
      ) : (
        <Button onClick={onNext} className="gap-2">
          Próximo 
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default OnboardingNavigation;
