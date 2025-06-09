
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

export const useOnboardingWizard = () => {
  // Estados reativos principais
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isWizardVisible, setIsWizardVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Função para salvar no localStorage
  const saveToStorage = useCallback((updates: Partial<OnboardingState>) => {
    const newState = {
      currentStep,
      isCompleted,
      isSkipped,
      isWizardVisible,
      ...updates
    };
    console.log('Salvando no localStorage:', newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, [currentStep, isCompleted, isSkipped, isWizardVisible]);

  // Carregar estado inicial apenas uma vez
  useEffect(() => {
    if (isInitialized) return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    console.log('Carregando estado inicial do localStorage:', saved);
    
    if (saved) {
      try {
        const state: OnboardingState = JSON.parse(saved);
        setCurrentStep(state.currentStep || 0);
        setIsCompleted(state.isCompleted || false);
        setIsSkipped(state.isSkipped || false);
        
        // Só mostrar se não foi completado nem pulado
        if (!state.isCompleted && !state.isSkipped) {
          setIsWizardVisible(state.isWizardVisible ?? true);
        } else {
          setIsWizardVisible(false);
        }
      } catch (error) {
        console.error('Erro ao carregar estado do onboarding:', error);
        // Primeira vez - mostrar onboarding
        setIsWizardVisible(true);
      }
    } else {
      // Primeira vez - mostrar onboarding
      setIsWizardVisible(true);
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  const nextStep = useCallback(() => {
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(nextStepIndex);
      saveToStorage({ currentStep: nextStepIndex });
    } else {
      completeOnboarding();
    }
  }, [currentStep, saveToStorage]);

  const previousStep = useCallback(() => {
    const prevStepIndex = currentStep - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(prevStepIndex);
      saveToStorage({ currentStep: prevStepIndex });
    }
  }, [currentStep, saveToStorage]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(stepIndex);
      saveToStorage({ currentStep: stepIndex });
    }
  }, [saveToStorage]);

  const skipOnboarding = useCallback(() => {
    console.log('Pulando onboarding');
    setIsSkipped(true);
    setIsWizardVisible(false);
    saveToStorage({ isSkipped: true, isWizardVisible: false });
  }, [saveToStorage]);

  const completeOnboarding = useCallback(() => {
    console.log('Completando onboarding');
    setIsCompleted(true);
    setIsWizardVisible(false);
    saveToStorage({ isCompleted: true, isWizardVisible: false });
  }, [saveToStorage]);

  const resetOnboarding = useCallback(() => {
    console.log('Resetando onboarding');
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(0);
    setIsCompleted(false);
    setIsSkipped(false);
    setIsWizardVisible(true);
  }, []);

  const hideWizard = useCallback(() => {
    console.log('Escondendo wizard');
    setIsWizardVisible(false);
    saveToStorage({ isWizardVisible: false });
  }, [saveToStorage]);

  const showWizard = useCallback(() => {
    console.log('Mostrando wizard');
    setIsWizardVisible(true);
    saveToStorage({ isWizardVisible: true });
  }, [saveToStorage]);

  const closeModal = useCallback(() => {
    hideWizard();
  }, [hideWizard]);

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
