
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
  const [hasRunInitialDetection, setHasRunInitialDetection] = useState(false);
  const [hasNavigatedFromModal, setHasNavigatedFromModal] = useState(false);

  // Verificar se um passo está completo APENAS baseado no progresso do banco
  const isStepCompleted = (stepId: string) => {
    const stepProgress = progress.find(p => p.step_id === stepId);
    return stepProgress?.completed || false;
  };

  // Detectar e marcar passos concluídos automaticamente - APENAS na primeira inicialização E se não há progresso
  useEffect(() => {
    if (!user || loading || servicesLoading || employeesLoading || progressLoading || !isInitialized) {
      return;
    }

    // Só executar detecção automática se:
    // 1. Ainda não executou
    // 2. NÃO há nenhum progresso na tabela (nem true nem false)
    // 3. Há dados para detectar
    if (!hasRunInitialDetection && progress.length === 0 && (services.length > 0 || employees.length > 0)) {
      console.log('Running initial auto-detection of completed steps - no existing progress found');
      detectAndMarkCompletedSteps(services.length, employees.length);
      setHasRunInitialDetection(true);
    } else {
      console.log('Skipping auto-detection:', {
        hasRunInitialDetection,
        progressExists: progress.length > 0,
        hasData: services.length > 0 || employees.length > 0
      });
    }
  }, [services.length, employees.length, user, loading, servicesLoading, employeesLoading, progressLoading, isInitialized, hasRunInitialDetection, progress.length, detectAndMarkCompletedSteps]);

  // Inicializar estado do onboarding
  useEffect(() => {
    if (!user || loading || progressLoading) return;

    console.log('Initializing onboarding state', { 
      servicesCount: services.length, 
      employeesCount: employees.length,
      progressSteps: progress.map(p => ({ id: p.step_id, completed: p.completed })),
      dontShowAgain: settings.dont_show_again,
      isCompleted: settings.is_completed,
      currentStepIndex: settings.current_step_index,
      hasNavigatedFromModal
    });

    // Se usuário escolheu não mostrar mais
    if (settings.dont_show_again) {
      setState(prev => ({ ...prev, dontShowAgain: true, isOpen: false }));
      setIsInitialized(true);
      return;
    }

    // Atualizar os passos com status de conclusão baseado APENAS no banco
    const updatedSteps = ONBOARDING_STEPS.map(step => ({
      ...step,
      completed: isStepCompleted(step.id)
    }));

    // Usar SEMPRE o current_step_index do banco, sem "adivinhar"
    const currentStepIndex = settings.current_step_index || 0;
    
    // Verificar se está completo baseado apenas no banco
    const allMainStepsComplete = ONBOARDING_STEPS.slice(0, -1).every(step => isStepCompleted(step.id));

    let shouldShowOnboarding = true;

    // Só não mostrar se está completamente finalizado
    if (allMainStepsComplete && settings.is_completed) {
      shouldShowOnboarding = false;
    }

    // Se navegou do modal para uma página, não reabrir automaticamente
    if (hasNavigatedFromModal) {
      shouldShowOnboarding = false;
    }

    const initialState = {
      isOpen: shouldShowOnboarding,
      currentStepIndex, // Usar exatamente o valor do banco
      steps: updatedSteps,
      canSkip: true,
      dontShowAgain: settings.dont_show_again
    };

    setState(initialState);
    setIsInitialized(true);
  }, [user, loading, progressLoading, progress, settings, hasNavigatedFromModal]);

  // Resetar flag quando a localização muda para uma rota diferente do passo atual
  useEffect(() => {
    if (hasNavigatedFromModal && state.steps[state.currentStepIndex]?.route !== location.pathname) {
      setHasNavigatedFromModal(false);
    }
  }, [location.pathname, hasNavigatedFromModal, state.currentStepIndex, state.steps]);

  // Ações do onboarding
  const nextStep = () => {
    const nextIndex = state.currentStepIndex + 1;
    
    if (nextIndex < state.steps.length) {
      const nextStep = state.steps[nextIndex];
      
      console.log('Moving to next step:', nextStep);
      
      // Atualizar o índice atual
      setState(prev => ({ ...prev, currentStepIndex: nextIndex }));
      updateSettings({ current_step_index: nextIndex });
      
      // Se o próximo step tem uma rota, navegar para lá e manter modal fechado
      if (nextStep.route) {
        console.log('Next step has route, navigating to:', nextStep.route);
        setHasNavigatedFromModal(true);
        navigate(nextStep.route);
        setState(prev => ({ ...prev, isOpen: false }));
      } else {
        // Se não tem rota, abrir o modal do onboarding
        console.log('Next step has no route, opening modal');
        setHasNavigatedFromModal(false);
        setState(prev => ({ ...prev, isOpen: true }));
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
    
    // Resetar estado local IMEDIATAMENTE - sempre começar do passo 0
    const resetSteps = ONBOARDING_STEPS.map(step => ({ ...step, completed: false }));
    setState({
      isOpen: true,
      currentStepIndex: 0, // Sempre começar do início após reset
      steps: resetSteps,
      canSkip: true,
      dontShowAgain: false
    });
    
    // Resetar flags
    setHasRunInitialDetection(false);
    setHasNavigatedFromModal(false);
    
    console.log('Onboarding reset completed - state updated to step 0');
  };

  // Helper para páginas - agora permite reabrir o modal quando interage com o banner
  const getCurrentStepForPage = () => {
    if (settings.dont_show_again || !isInitialized) return null;
    
    const incompleteSteps = state.steps.filter(step => !isStepCompleted(step.id));
    if (incompleteSteps.length === 0) return null;
    
    const matchingStep = state.steps.find(step => 
      step.route === location.pathname && !isStepCompleted(step.id)
    );
    
    return matchingStep || null;
  };

  // Função para reabrir o modal quando o usuário interage com o banner
  const reopenModal = () => {
    setHasNavigatedFromModal(false);
    setState(prev => ({ ...prev, isOpen: true }));
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
    reopenModal,
    setDontShowAgain,
    nextStep,
    goToStep,
    skipTutorial,
    closeTutorial,
    resetOnboarding: handleResetOnboarding,
    markStepCompleted
  };
};
