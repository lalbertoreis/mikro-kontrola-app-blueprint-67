
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { OnboardingStep } from './steps/OnboardingSteps';
import { DialogFooter } from "@/components/ui/dialog";

interface OnboardingContentProps {
  currentStep: OnboardingStep;
  currentStepIndex: number;
  totalSteps: number;
  dontShowAgain: boolean;
  setDontShowAgain: (value: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onDismiss: () => void;
}

const OnboardingContent: React.FC<OnboardingContentProps> = ({
  currentStep,
  currentStepIndex,
  totalSteps,
  dontShowAgain,
  setDontShowAgain,
  onNext,
  onPrev,
  onDismiss
}) => {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <>
      <div className="py-4">
        <div className="mb-6 text-center">
          <p className="text-muted-foreground">{currentStep.content}</p>
          
          {/* Only show buttons for navigation when not requiring clicks */}
          {!currentStep.requiresClick && currentStep.route && (
            <Button variant="outline" asChild className="mt-4">
              <Link to={currentStep.route}>
                Ir para esta seção
              </Link>
            </Button>
          )}
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentStepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        
        {isLastStep && (
          <div className="flex items-center space-x-2 mt-8">
            <Checkbox 
              id="dontShow" 
              checked={dontShowAgain} 
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label htmlFor="dontShow" className="text-sm font-medium leading-none cursor-pointer">
              Não mostrar novamente
            </label>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <div className="flex justify-between w-full">
          {!isFirstStep ? (
            <Button variant="outline" onClick={onPrev}>
              Voltar
            </Button>
          ) : (
            <div></div> // Empty div for spacing when there's no "back" button
          )}
          
          {isLastStep ? (
            <Button onClick={onDismiss} className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Concluir
            </Button>
          ) : (
            <Button onClick={onNext} className="flex items-center">
              Próximo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogFooter>
    </>
  );
};

export default OnboardingContent;
