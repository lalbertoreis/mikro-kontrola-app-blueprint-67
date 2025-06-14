
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, PlayCircle } from 'lucide-react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { OnboardingWizard } from './OnboardingWizard';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployeePermissions } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const OnboardingManager: React.FC = () => {
  const { user } = useAuth();
  const { checkEmployeePermissions } = useEmployeePermissions();
  const location = useLocation();
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null);
  
  const { 
    isCompleted, 
    isSkipped, 
    isWizardVisible,
    showWizard 
  } = useOnboardingWizard();

  // Verificar se o usuário é funcionário
  useEffect(() => {
    const checkUserType = async () => {
      if (!user) return;
      
      try {
        const permissions = await checkEmployeePermissions();
        setIsEmployee(!!permissions);
      } catch (error) {
        console.error("Erro ao verificar tipo de usuário:", error);
        setIsEmployee(false);
      }
    };

    checkUserType();
  }, [user, checkEmployeePermissions]);

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
    isEmployee,
    shouldShowResumeButton: !isWizardVisible && !isCompleted && !isSkipped && !isEmployee,
    shouldShowTutorialButtonAfterComplete: (isCompleted || isSkipped) && !isWizardVisible && shouldShowTutorialButton && !isEmployee
  });

  // Não mostrar nada se o usuário não estiver logado ou for funcionário
  if (!user || isEmployee) {
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
