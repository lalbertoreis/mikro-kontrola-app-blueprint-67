
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, HelpCircle, PlayCircle } from 'lucide-react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { OnboardingWizard } from './OnboardingWizard';

export const OnboardingManager: React.FC = () => {
  const { 
    isCompleted, 
    isSkipped, 
    shouldShowResumeButton,
    resetOnboarding, 
    openModal,
    showWizard 
  } = useOnboardingWizard();

  return (
    <>
      <OnboardingWizard />
      
      {/* Botões flutuantes */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="flex flex-col space-y-2">
          {/* Botão para retomar tutorial quando minimizado */}
          {shouldShowResumeButton && (
            <Button
              onClick={showWizard}
              className="flex items-center space-x-2 shadow-lg bg-primary hover:bg-primary/90 text-white"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Retomar Tutorial</span>
            </Button>
          )}
          
          {/* Botão para reabrir tutorial quando completado/pulado */}
          {(isCompleted || isSkipped) && !shouldShowResumeButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={openModal}
              className="flex items-center space-x-2 shadow-lg"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Tutorial</span>
            </Button>
          )}
          
          {/* Botão para resetar */}
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
    </>
  );
};
