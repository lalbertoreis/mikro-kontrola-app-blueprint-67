
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, HelpCircle, PlayCircle } from 'lucide-react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { OnboardingWizard } from './OnboardingWizard';

export const OnboardingManager: React.FC = () => {
  const { 
    isCompleted, 
    isSkipped, 
    isWizardVisible,
    resetOnboarding, 
    showWizard 
  } = useOnboardingWizard();

  const shouldShowFloatingButton = !isWizardVisible && !isCompleted && !isSkipped;

  return (
    <>
      <OnboardingWizard />
      
      {/* Botão flutuante "Retomar Tutorial" */}
      {shouldShowFloatingButton && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={showWizard}
            className="flex items-center space-x-2 shadow-lg animate-pulse bg-primary hover:bg-primary/90 text-white"
            size="sm"
          >
            <PlayCircle className="w-4 h-4" />
            <span>🔁 Retomar Tutorial</span>
          </Button>
        </div>
      )}

      {/* Botões discretos no dashboard quando completado/pulado */}
      {(isCompleted || isSkipped) && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={showWizard}
              className="flex items-center space-x-2 shadow-lg"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Tutorial</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetOnboarding}
              className="flex items-center space-x-2 shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resetar</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
