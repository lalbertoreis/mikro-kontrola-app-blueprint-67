
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

// Estado global compartilhado entre todas as instâncias
let globalOnboardingState: OnboardingState = {
  currentStep: 0,
  isCompleted: false,
  isSkipped: false,
  isWizardVisible: false
};

// Lista de listeners para notificar mudanças
const stateListeners = new Set<() => void>();

// Função para notificar todos os listeners
const notifyStateChange = () => {
  stateListeners.forEach(listener => listener());
};

// Função para atualizar o estado global
const updateGlobalState = (updates: Partial<OnboardingState>) => {
  console.log('=== ATUALIZANDO ESTADO GLOBAL ===');
  console.log('Estado anterior:', globalOnboardingState);
  console.log('Updates:', updates);
  
  globalOnboardingState = { ...globalOnboardingState, ...updates };
  
  console.log('Novo estado:', globalOnboardingState);
  
  // Salvar no localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(globalOnboardingState));
  
  // Notificar todos os componentes
  notifyStateChange();
};

export const useOnboardingWizard = () => {
  // Estados locais que são sincronizados com o estado global
  const [localState, setLocalState] = useState<OnboardingState>(globalOnboardingState);

  // Listener para mudanças no estado global
  useEffect(() => {
    const listener = () => {
      console.log('Listener: Estado global mudou para:', globalOnboardingState);
      setLocalState({ ...globalOnboardingState });
    };
    
    stateListeners.add(listener);
    
    return () => {
      stateListeners.delete(listener);
    };
  }, []);

  // Inicialização única no primeiro render
  useEffect(() => {
    console.log('=== INICIALIZANDO ONBOARDING ===');
    
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
      try {
        const state: OnboardingState = JSON.parse(saved);
        console.log('Estado salvo encontrado:', state);
        
        // Lógica para mostrar wizard na inicialização
        if (!state.isCompleted && !state.isSkipped) {
          state.isWizardVisible = state.isWizardVisible ?? true;
        } else {
          state.isWizardVisible = false;
        }
        
        globalOnboardingState = state;
        setLocalState(state);
      } catch (error) {
        console.error('Erro ao carregar estado:', error);
        const defaultState = {
          currentStep: 0,
          isCompleted: false,
          isSkipped: false,
          isWizardVisible: true
        };
        globalOnboardingState = defaultState;
        setLocalState(defaultState);
      }
    } else {
      console.log('Primeira visita - mostrando onboarding');
      const defaultState = {
        currentStep: 0,
        isCompleted: false,
        isSkipped: false,
        isWizardVisible: true
      };
      globalOnboardingState = defaultState;
      setLocalState(defaultState);
    }
  }, []);

  const nextStep = useCallback(() => {
    const nextStepIndex = localState.currentStep + 1;
    if (nextStepIndex < ONBOARDING_STEPS.length) {
      updateGlobalState({ currentStep: nextStepIndex });
    } else {
      completeOnboarding();
    }
  }, [localState.currentStep]);

  const previousStep = useCallback(() => {
    const prevStepIndex = localState.currentStep - 1;
    if (prevStepIndex >= 0) {
      updateGlobalState({ currentStep: prevStepIndex });
    }
  }, [localState.currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
      updateGlobalState({ currentStep: stepIndex });
    }
  }, []);

  const skipOnboarding = useCallback(() => {
    console.log('=== PULANDO ONBOARDING ===');
    updateGlobalState({ 
      isSkipped: true, 
      isWizardVisible: false 
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    console.log('=== COMPLETANDO ONBOARDING ===');
    updateGlobalState({ 
      isCompleted: true, 
      isWizardVisible: false 
    });
  }, []);

  const resetOnboarding = useCallback(() => {
    console.log('=== RESETANDO ONBOARDING ===');
    const resetState = {
      currentStep: 0,
      isCompleted: false,
      isSkipped: false,
      isWizardVisible: true
    };
    updateGlobalState(resetState);
  }, []);

  const hideWizard = useCallback(() => {
    console.log('=== ESCONDENDO WIZARD ===');
    console.log('Estado antes de esconder:', localState);
    updateGlobalState({ isWizardVisible: false });
  }, [localState]);

  const showWizard = useCallback(() => {
    console.log('=== MOSTRANDO WIZARD ===');
    updateGlobalState({ isWizardVisible: true });
  }, []);

  const closeModal = useCallback(() => {
    hideWizard();
  }, [hideWizard]);

  console.log('useOnboardingWizard render:', {
    localState,
    globalState: globalOnboardingState
  });

  return {
    // Estado reativo
    isOpen: localState.isWizardVisible,
    currentStep: localState.currentStep,
    currentStepData: ONBOARDING_STEPS[localState.currentStep],
    totalSteps: ONBOARDING_STEPS.length,
    isCompleted: localState.isCompleted,
    isSkipped: localState.isSkipped,
    isWizardVisible: localState.isWizardVisible,
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
    isFirstStep: localState.currentStep === 0,
    isLastStep: localState.currentStep === ONBOARDING_STEPS.length - 1,
    progress: ((localState.currentStep + 1) / ONBOARDING_STEPS.length) * 100
  };
};
