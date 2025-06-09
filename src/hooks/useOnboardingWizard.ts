
import { useState, useEffect } from 'react';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isWizardVisible, setIsWizardVisible] = useState(false);

  // Carregar estado do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: OnboardingState = JSON.parse(saved);
        setCurrentStep(state.currentStep);
        setIsCompleted(state.isCompleted);
        setIsSkipped(state.isSkipped);
        setIsWizardVisible(state.isWizardVisible ?? false);
        
        // Só mostrar se não foi completado nem pulado e estava visível
        if (!state.isCompleted && !state.isSkipped && (state.isWizardVisible ?? true)) {
          setIsWizardVisible(true);
        }
      } catch (error) {
        console.error('Erro ao carregar estado do onboarding:', error);
      }
    } else {
      // Primeira vez - mostrar onboarding
      setIsWizardVisible(true);
    }
  }, []);

  // Salvar estado no localStorage
  const saveState = (state: Partial<OnboardingState>) => {
    const currentState = {
      currentStep,
      isCompleted,
      isSkipped,
      isWizardVisible,
      ...state
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    
    if (state.currentStep !== undefined) setCurrentStep(state.currentStep);
    if (state.isCompleted !== undefined) setIsCompleted(state.isCompleted);
    if (state.isSkipped !== undefined) setIsSkipped(state.isSkipped);
    if (state.isWizardVisible !== undefined) setIsWizardVisible(state.isWizardVisible);
  };

  const nextStep = () => {
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < ONBOARDING_STEPS.length) {
      saveState({ currentStep: nextStepIndex });
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    const prevStepIndex = currentStep - 1;
    if (prevStepIndex >= 0) {
      saveState({ currentStep: prevStepIndex });
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
      saveState({ currentStep: stepIndex });
    }
  };

  const skipOnboarding = () => {
    saveState({ isSkipped: true, isWizardVisible: false });
  };

  const completeOnboarding = () => {
    saveState({ isCompleted: true, isWizardVisible: false });
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(0);
    setIsCompleted(false);
    setIsSkipped(false);
    setIsWizardVisible(true);
  };

  const hideWizard = () => {
    saveState({ isWizardVisible: false });
  };

  const showWizard = () => {
    saveState({ isWizardVisible: true });
  };

  const closeModal = () => {
    hideWizard();
  };

  return {
    // Estado
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
