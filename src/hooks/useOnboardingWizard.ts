
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
  isVisible: boolean;
}

export const useOnboardingWizard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Carregar estado do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: OnboardingState = JSON.parse(saved);
        setCurrentStep(state.currentStep);
        setIsCompleted(state.isCompleted);
        setIsSkipped(state.isSkipped);
        setIsVisible(state.isVisible !== undefined ? state.isVisible : true);
        
        // Só abrir se não foi completado nem pulado e está visível
        if (!state.isCompleted && !state.isSkipped && state.isVisible !== false) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Erro ao carregar estado do onboarding:', error);
      }
    } else {
      // Primeira vez - mostrar onboarding
      setIsOpen(true);
    }
  }, []);

  // Salvar estado no localStorage
  const saveState = (state: Partial<OnboardingState>) => {
    const currentState = {
      currentStep,
      isCompleted,
      isSkipped,
      isVisible,
      ...state
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    
    if (state.currentStep !== undefined) setCurrentStep(state.currentStep);
    if (state.isCompleted !== undefined) setIsCompleted(state.isCompleted);
    if (state.isSkipped !== undefined) setIsSkipped(state.isSkipped);
    if (state.isVisible !== undefined) setIsVisible(state.isVisible);
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
    saveState({ isSkipped: true, isVisible: false });
    setIsOpen(false);
  };

  const completeOnboarding = () => {
    saveState({ isCompleted: true, isVisible: false });
    setIsOpen(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(0);
    setIsCompleted(false);
    setIsSkipped(false);
    setIsVisible(true);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    // Sempre permitir abrir se não foi completado nem pulado
    if (!isCompleted && !isSkipped) {
      saveState({ isVisible: true });
      setIsOpen(true);
    }
  };

  const hideWizard = () => {
    saveState({ isVisible: false });
    setIsOpen(false);
  };

  const showWizard = () => {
    if (!isCompleted && !isSkipped) {
      saveState({ isVisible: true });
      setIsOpen(true);
    }
  };

  // Lógica corrigida para mostrar o botão de retomar
  const shouldShowResumeButton = !isCompleted && !isSkipped && !isVisible && !isOpen;

  return {
    // Estado
    isOpen,
    currentStep,
    currentStepData: ONBOARDING_STEPS[currentStep],
    totalSteps: ONBOARDING_STEPS.length,
    isCompleted,
    isSkipped,
    isVisible,
    steps: ONBOARDING_STEPS,
    shouldShowResumeButton,
    
    // Ações
    nextStep,
    previousStep,
    goToStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    closeModal,
    openModal,
    hideWizard,
    showWizard,
    
    // Helpers
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === ONBOARDING_STEPS.length - 1,
    progress: ((currentStep + 1) / ONBOARDING_STEPS.length) * 100
  };
};
