
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/hooks/useServices';
import { useEmployees } from '@/hooks/useEmployees';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { OnboardingState } from './types';
import { ONBOARDING_STEPS } from './data';

export const useOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { services, isLoading: servicesLoading } = useServices();
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { 
    progress, 
    settings, 
    isLoading: progressLoading, 
    markStepCompleted, 
    updateSettings, 
    resetOnboarding,
    detectAndMarkCompletedSteps
  } = useOnboardingProgress();
  
  const [state, setState] = useState<OnboardingState>({
    isOpen: false,
    currentStepIndex: 0,
    steps: ONBOARDING_STEPS,
    canSkip: true,
    dontShowAgain: false
  });

  const [isInitialized, setIsInitialized] = useState(false);

  console.log('useOnboarding state:', {
    currentStepIndex: state.currentStepIndex,
    currentStepId: state.steps[state.currentStepIndex]?.id,
    servicesCount: services.length,
    employeesCount: employees.length,
    isLoading: servicesLoading || employeesLoading || progressLoading,
    pathname: location.pathname,
    isInitialized,
    isOpen: state.isOpen,
    dontShowAgain: settings.dont_show_again,
    progressCount: progress.length,
    settings,
    progressSteps: progress.map(p => ({ id: p.step_id, completed: p.completed }))
  });

  // Verificar se um passo está completo baseado no progresso do banco
  const isStepCompleted = (stepId: string) => {
    const stepProgress = progress.find(p => p.step_id === stepId);
    if (stepProgress?.completed) return true;

    // Verificar baseado nos dados reais como fallback
    switch (stepId) {
      case 'services':
        return services.length > 0;
      case 'employees':
        return employees.length > 0;
      default:
        return false;
    }
  };

  // Encontrar o primeiro passo incompleto
  const findFirstIncompleteStep = () => {
    const incompleteIndex = ONBOARDING_STEPS.findIndex(step => 
      !isStepCompleted(step.id) && step.id !== 'complete'
    );
    
    // Se todos os passos principais estão completos, ir para o último (complete)
    if (incompleteIndex === -1) {
      return ONBOARDING_STEPS.length - 1;
    }
    
    return incompleteIndex;
  };

  // Detectar e marcar passos concluídos automaticamente
  useEffect(() => {
    if (!user || loading || servicesLoading || employeesLoading || progressLoading || !isInitialized) {
      return;
    }

    console.log('Running auto-detection of completed steps');
    detectAndMarkCompletedSteps(services.length, employees.length);
  }, [services.length, employees.length, user, loading, servicesLoading, employeesLoading, progressLoading, isInitialized]);

  // Inicializar estado do onboarding
  useEffect(() => {
    if (!user || loading || progressLoading) return;

    console.log('Initializing onboarding state', { 
      servicesCount: services.length, 
      employeesCount: employees.length,
      progressSteps: progress.map(p => ({ id: p.step_id, completed: p.completed })),
      dontShowAgain: settings.dont_show_again,
      isCompleted: settings.is_completed
    });

    // Se usuário escolheu não mostrar mais
    if (settings.dont_show_again) {
      console.log('User chose not to see onboarding again');
      setState(prev => ({ ...prev, dontShowAgain: true, isOpen: false }));
      setIsInitialized(true);
      return;
    }

    // Atualizar os passos com status de conclusão baseado nos dados reais + banco
    const updatedSteps = ONBOARDING_STEPS.map(step => ({
      ...step,
      completed: isStepCompleted(step.id)
    }));

    const firstIncompleteIndex = findFirstIncompleteStep();
    const allMainStepsComplete = ONBOARDING_STEPS.slice(0, -1).every(step => isStepCompleted(step.id));

    let currentStepIndex = 0;
    let shouldShowOnboarding = true;

    if (allMainStepsComplete && settings.is_completed) {
      // Tutorial completamente finalizado
      console.log('Tutorial completely finished');
      shouldShowOnboarding = false;
    } else if (allMainStepsComplete && !settings.is_completed) {
      // Todos os passos principais completos, mostrar passo final
      console.log('All main steps complete, showing final step');
      currentStepIndex = ONBOARDING_STEPS.length - 1;
    } else {
      // Há passos incompletos
      console.log('Found incomplete steps, starting from:', firstIncompleteIndex);
      currentStepIndex = firstIncompleteIndex;
    }

    const initialState = {
      isOpen: shouldShowOnboarding,
      currentStepIndex,
      steps: updatedSteps,
      canSkip: true,
      dontShowAgain: settings.dont_show_again
    };

    console.log('Setting initial onboarding state:', initialState);
    setState(initialState);
    
    // Atualizar índice do passo atual nas configurações se necessário
    if (settings.current_step_index !== currentStepIndex) {
      updateSettings({ current_step_index: currentStepIndex });
    }
    
    setIsInitialized(true);
  }, [user, loading, progressLoading, progress, settings, services.length, employees.length]);

  // Ações do onboarding
  const nextStep = () => {
    const currentStep = state.steps[state.currentStepIndex];
    
    if (currentStep.route) {
      // Navegar para a rota do passo
      navigate(currentStep.route);
      
      // Fechar modal temporariamente
      setState(prev => ({ ...prev, isOpen: false }));
      updateSettings({ current_step_index: state.currentStepIndex });
    } else {
      // Apenas mover para próximo passo
      const nextIndex = state.currentStepIndex + 1;
      if (nextIndex < state.steps.length) {
        setState(prev => ({ ...prev, currentStepIndex: nextIndex }));
        updateSettings({ current_step_index: nextIndex });
      }
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      setState(prev => ({ ...prev, currentStepIndex: stepIndex }));
      updateSettings({ current_step_index: stepIndex });
    }
  };

  const skipTutorial = () => {
    setState(prev => ({ ...prev, isOpen: false, dontShowAgain: true }));
    updateSettings({ 
      dont_show_again: true, 
      is_completed: true,
      current_step_index: state.steps.length - 1 
    });
  };

  const closeTutorial = () => {
    setState(prev => ({ ...prev, isOpen: false }));
    
    // Se está no último passo, marcar como completo
    if (state.currentStepIndex === state.steps.length - 1) {
      updateSettings({ is_completed: true });
    }
    
    if (state.dontShowAgain) {
      updateSettings({ dont_show_again: true });
    }
  };

  const setDontShowAgain = (value: boolean) => {
    setState(prev => ({ ...prev, dontShowAgain: value }));
  };

  const handleResetOnboarding = async () => {
    console.log('Resetting onboarding');
    await resetOnboarding();
    
    // Resetar estado local
    setState({
      isOpen: true,
      currentStepIndex: 0,
      steps: ONBOARDING_STEPS.map(step => ({ ...step, completed: false })),
      canSkip: true,
      dontShowAgain: false
    });
    
    // Recarregar dados para garantir sincronia
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Helper para páginas
  const getCurrentStepForPage = () => {
    if (settings.dont_show_again || !isInitialized) return null;
    
    const incompleteSteps = state.steps.filter(step => !isStepCompleted(step.id));
    if (incompleteSteps.length === 0) return null;
    
    const matchingStep = state.steps.find(step => 
      step.route === location.pathname && !isStepCompleted(step.id)
    );
    
    return matchingStep || null;
  };

  const isOnboardingActive = !settings.dont_show_again && 
    state.steps.some(step => !isStepCompleted(step.id) && step.id !== 'welcome' && step.id !== 'complete');

  return {
    isOpen: state.isOpen,
    currentStep: state.steps[state.currentStepIndex],
    currentStepIndex: state.currentStepIndex,
    steps: state.steps.map(step => ({ ...step, completed: isStepCompleted(step.id) })),
    dontShowAgain: state.dontShowAgain,
    isOnboardingActive,
    getCurrentStepForPage,
    setDontShowAgain,
    nextStep,
    goToStep,
    skipTutorial,
    closeTutorial,
    resetOnboarding: handleResetOnboarding
  };
};
