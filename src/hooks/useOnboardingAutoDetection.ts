
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingProgress } from '@/types/onboarding';

interface UseOnboardingAutoDetectionProps {
  progress: OnboardingProgress[];
  isLoading: boolean;
  wasRecentlyReset: boolean;
  markStepCompleted: (stepId: string) => Promise<void>;
}

export const useOnboardingAutoDetection = ({
  progress,
  isLoading,
  wasRecentlyReset,
  markStepCompleted
}: UseOnboardingAutoDetectionProps) => {
  const { user } = useAuth();

  // Detectar e marcar passos automaticamente - MUITO MAIS RESTRITIVO
  const detectAndMarkCompletedSteps = async (servicesCount: number, employeesCount: number) => {
    if (!user || isLoading || wasRecentlyReset) {
      console.log('Skipping auto-detection:', { 
        noUser: !user, 
        isLoading, 
        wasRecentlyReset 
      });
      return;
    }

    console.log('Checking if auto-detection should run:', { 
      servicesCount, 
      employeesCount, 
      progressCount: progress.length,
      hasAnyProgress: progress.length > 0,
      hasAnyCompletedProgress: progress.some(p => p.completed === true)
    });

    // NUNCA executar detecção automática se:
    // 1. Já existe QUALQUER progresso na tabela (mesmo que false)
    // 2. Não há serviços nem funcionários para detectar
    // 3. Foi resetado recentemente
    if (progress.length > 0 || (servicesCount === 0 && employeesCount === 0)) {
      console.log('Skipping auto-detection - progress exists or no data to detect');
      return;
    }

    console.log('Running auto-detection for the first time');

    const stepsToCheck = [];

    // Verificar se serviços foram adicionados
    if (servicesCount > 0) {
      console.log('Auto-completing services step');
      stepsToCheck.push('services');
    }

    // Verificar se funcionários foram adicionados
    if (employeesCount > 0) {
      console.log('Auto-completing employees step');
      stepsToCheck.push('employees');
    }

    // Marcar todos os passos detectados como completos
    for (const stepId of stepsToCheck) {
      await markStepCompleted(stepId);
    }
  };

  return {
    detectAndMarkCompletedSteps
  };
};
