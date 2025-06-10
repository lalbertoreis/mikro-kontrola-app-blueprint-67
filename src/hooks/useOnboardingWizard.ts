
import { useState, useEffect, useCallback } from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: string;
  component?: React.ComponentType;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao KontrolaApp!',
    description: 'Vamos configurar seu negócio em alguns passos simples.',
    content: 'Este tutorial irá te guiar através das principais funcionalidades da plataforma.'
  },
  {
    id: 'business-info',
    title: 'Informações do Negócio',
    description: 'Configure os dados básicos da sua empresa.',
    content: 'Defina o nome, logo e informações de contato do seu negócio.'
  },
  {
    id: 'services',
    title: 'Cadastre seus Serviços',
    description: 'Adicione os serviços que você oferece.',
    content: 'Configure preços, duração e descrições dos seus serviços.'
  },
  {
    id: 'employees',
    title: 'Adicione Funcionários',
    description: 'Cadastre sua equipe de trabalho.',
    content: 'Configure turnos, permissões e serviços que cada funcionário pode realizar.'
  },
  {
    id: 'clients',
    title: 'Gestão de Clientes',
    description: 'Organize sua base de clientes.',
    content: 'Cadastre clientes e mantenha histórico de atendimentos.'
  },
  {
    id: 'calendar',
    title: 'Agenda e Agendamentos',
    description: 'Configure sua agenda de trabalho.',
    content: 'Gerencie horários, bloqueios e agendamentos da sua equipe.'
  },
  {
    id: 'online-booking',
    title: 'Agenda Online',
    description: 'Permita agendamentos online.',
    content: 'Configure sua página pública para que clientes possam agendar online.'
  },
  {
    id: 'payment-methods',
    title: 'Métodos de Pagamento',
    description: 'Configure formas de pagamento.',
    content: 'Defina quais métodos de pagamento você aceita.'
  },
  {
    id: 'holidays',
    title: 'Feriados e Bloqueios',
    description: 'Configure datas especiais.',
    content: 'Defina feriados e bloqueios automáticos na agenda.'
  },
  {
    id: 'finance',
    title: 'Controle Financeiro',
    description: 'Gerencie receitas e despesas.',
    content: 'Configure custos fixos e acompanhe seu faturamento.'
  },
  {
    id: 'complete',
    title: 'Configuração Concluída!',
    description: 'Seu negócio está pronto para começar.',
    content: 'Agora você pode começar a usar todas as funcionalidades da plataforma.'
  }
];

const STORAGE_KEY = 'kontrola-onboarding';

interface OnboardingState {
  currentStep: number;
  isCompleted: boolean;
  isSkipped: boolean;
  isWizardVisible: boolean;
}

// Estado global simples para garantir sincronização
let globalState: OnboardingState | null = null;

export const useOnboardingWizard = () => {
  // Estados locais que serão sincronizados
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isWizardVisible, setIsWizardVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Função para atualizar localStorage
  const updateStorage = useCallback((state: OnboardingState) => {
    console.log('Atualizando localStorage:', state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    globalState = state;
  }, []);

  // Função para atualizar estado completo
  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    const newState = {
      currentStep,
      isCompleted,
      isSkipped,
      isWizardVisible,
      ...updates
    };

    console.log('Atualizando estado completo:', newState);

    // Atualizar estados locais
    if (updates.currentStep !== undefined) setCurrentStep(updates.currentStep);
    if (updates.isCompleted !== undefined) setIsCompleted(updates.isCompleted);
    if (updates.isSkipped !== undefined) setIsSkipped(updates.isSkipped);
    if (updates.isWizardVisible !== undefined) setIsWizardVisible(updates.isWizardVisible);

    // Atualizar localStorage
    updateStorage(newState);
  }, [currentStep, isCompleted, isSkipped, isWizardVisible, updateStorage]);

  // Inicialização única
  useEffect(() => {
    if (isInitialized) return;

    console.log('Inicializando onboarding...');
    
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
      try {
        const state: OnboardingState = JSON.parse(saved);
        console.log('Estado salvo encontrado:', state);
        
        globalState = state;
        setCurrentStep(state.currentStep || 0);
        setIsCompleted(state.isCompleted || false);
        setIsSkipped(state.isSkipped || false);
        
        // Lógica para mostrar wizard
        if (!state.isCompleted && !state.isSkipped) {
          setIsWizardVisible(state.isWizardVisible ?? true);
        } else {
          setIsWizardVisible(false);
        }
      } catch (error) {
        console.error('Erro ao carregar estado:', error);
        setIsWizardVisible(true);
      }
    } else {
      console.log('Primeira visita - mostrando onboarding');
      setIsWizardVisible(true);
    }
    
    setIsInitialized(true);
  }, []);

  const nextStep = useCallback(() => {
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < ONBOARDING_STEPS.length) {
      updateState({ currentStep: nextStepIndex });
    } else {
      completeOnboarding();
    }
  }, [currentStep, updateState]);

  const previousStep = useCallback(() => {
    const prevStepIndex = currentStep - 1;
    if (prevStepIndex >= 0) {
      updateState({ currentStep: prevStepIndex });
    }
  }, [currentStep, updateState]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
      updateState({ currentStep: stepIndex });
    }
  }, [updateState]);

  const skipOnboarding = useCallback(() => {
    console.log('Pulando onboarding');
    updateState({ 
      isSkipped: true, 
      isWizardVisible: false 
    });
  }, [updateState]);

  const completeOnboarding = useCallback(() => {
    console.log('Completando onboarding');
    updateState({ 
      isCompleted: true, 
      isWizardVisible: false 
    });
  }, [updateState]);

  const resetOnboarding = useCallback(() => {
    console.log('Resetando onboarding');
    localStorage.removeItem(STORAGE_KEY);
    globalState = null;
    
    setCurrentStep(0);
    setIsCompleted(false);
    setIsSkipped(false);
    setIsWizardVisible(true);
    
    updateStorage({
      currentStep: 0,
      isCompleted: false,
      isSkipped: false,
      isWizardVisible: true
    });
  }, [updateStorage]);

  const hideWizard = useCallback(() => {
    console.log('Escondendo wizard - estado antes:', { isWizardVisible });
    updateState({ isWizardVisible: false });
    console.log('Escondendo wizard - estado depois será:', false);
  }, [isWizardVisible, updateState]);

  const showWizard = useCallback(() => {
    console.log('Mostrando wizard');
    updateState({ isWizardVisible: true });
  }, [updateState]);

  const closeModal = useCallback(() => {
    hideWizard();
  }, [hideWizard]);

  console.log('useOnboardingWizard render:', {
    currentStep,
    isCompleted,
    isSkipped,
    isWizardVisible,
    globalState
  });

  return {
    // Estado reativo
    isOpen: isWizardVisible,
    currentStep,
    currentStepData: ONBOARDING_STEPS[currentStep],
    totalSteps: ONBOARDING_STEPS.length,
    isCompleted,
    isSkipped,
    isWizardVisible,
    steps: ONBOARDING_STEPS,
    
    // Ações
    nextStep,
    previousStep,
    goToStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    closeModal,
    hideWizard,
    showWizard,
    
    // Helpers
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === ONBOARDING_STEPS.length - 1,
    progress: ((currentStep + 1) / ONBOARDING_STEPS.length) * 100
  };
};
