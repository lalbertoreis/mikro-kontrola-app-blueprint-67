
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, PlayCircle } from 'lucide-react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { OnboardingWizard } from './OnboardingWizard';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

export const OnboardingManager: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { 
    isCompleted, 
    isSkipped, 
    isWizardVisible,
    showWizard 
  } = useOnboardingWizard();

  // Páginas onde o botão Tutorial deve aparecer após conclusão
  const allowedPagesForTutorialButton = ['/dashboard', '/dashboard/settings'];
  const shouldShowTutorialButton = allowedPagesForTutorialButton.includes(location.pathname);

  console.log('OnboardingManager render:', {
    isCompleted,
    isSkipped,
    isWizardVisible,
    userLoggedIn: !!user,
    currentPath: location.pathname,
    shouldShowTutorialButton,
    shouldShowResumeButton: !isWizardVisible && !isCompleted && !isSkipped,
    shouldShowTutorialButtonAfterComplete: (isCompleted || isSkipped) && !isWizardVisible && shouldShowTutorialButton
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

      {/* Botão Tutorial quando completado/pulado - apenas em páginas específicas */}
      {(isCompleted || isSkipped) && !isWizardVisible && shouldShowTutorialButton && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={showWizard}
            className="flex items-center space-x-2 shadow-lg"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Tutorial</span>
          </Button>
        </div>
      )}
    </>
  );
};
