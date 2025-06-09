
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, HelpCircle } from 'lucide-react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { OnboardingWizard } from './OnboardingWizard';

export const OnboardingManager: React.FC = () => {
  const { isCompleted, isSkipped, resetOnboarding, openModal } = useOnboardingWizard();

  // Se não foi completado nem pulado, o modal irá aparecer automaticamente
  if (!isCompleted && !isSkipped) {
    return <OnboardingWizard />;
  }

  // Botão para reabrir o onboarding se necessário
  return (
    <>
      <OnboardingWizard />
      
      {/* Botão discreto no dashboard para reabrir */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="flex flex-col space-y-2">
          {(isCompleted || isSkipped) && (
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
