
import { useState, useEffect } from 'react';
import { OnboardingState } from '@/types/onboardingTypes';

const STORAGE_KEY = 'kontrola-onboarding';

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
export const updateGlobalState = (updates: Partial<OnboardingState>) => {
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

export const useOnboardingState = () => {
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
        
        // NOVA LÓGICA: Sempre mostrar wizard se não estiver completado nem pulado
        if (!state.isCompleted && !state.isSkipped) {
          console.log('Tutorial incompleto - mostrando wizard automaticamente');
          state.isWizardVisible = true;
        } else {
          console.log('Tutorial já finalizado - wizard oculto');
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

  return localState;
};
