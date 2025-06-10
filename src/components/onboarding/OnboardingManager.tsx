
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, HelpCircle, PlayCircle } from 'lucide-react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { OnboardingWizard } from './OnboardingWizard';
import { useAuth } from '@/contexts/AuthContext';

export const OnboardingManager: React.FC = () => {
  const { user } = useAuth();
  const { 
    isCompleted, 
    isSkipped, 
    isWizardVisible,
    resetOnboarding, 
    showWizard 
  } = useOnboardingWizard();

  console.log('OnboardingManager render:', {
    isCompleted,
    isSkipped,
    isWizardVisible,
    userLoggedIn: !!user,
    shouldShowResumeButton: !isWizardVisible && !isCompleted && !isSkipped,
    shouldShowControlButtons: (isCompleted || isSkipped) && !isWizardVisible
  });

  // Não mostrar nada se o usuário não estiver logado
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Renderizar o wizard apenas quando visível */}
      {isWizardVisible && <OnboardingWizard />}
      
      {/* Botão "Retomar Tutorial" - aparece quando wizard está oculto e não foi completado/pulado */}
      {!isWizardVisible && !isCompleted && !isSkipped && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={showWizard}
            className="flex items-center space-x-2 shadow-lg animate-pulse bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            <PlayCircle className="w-4 h-4" />
            <span>🔁 Retomar Tutorial</span>
          </Button>
        </div>
      )}

      {/* Botões de controle quando completado/pulado */}
      {(isCompleted || isSkipped) && !isWizardVisible && (
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
