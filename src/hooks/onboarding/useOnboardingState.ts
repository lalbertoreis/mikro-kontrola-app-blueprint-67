
import { useState, useEffect } from 'react';
import { OnboardingState } from '@/types/onboardingTypes';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseOnboarding } from './useSupabaseOnboarding';

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
  
  // Manter backup no localStorage (fallback)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(globalOnboardingState));
  
  // Notificar todos os componentes
  notifyStateChange();
};

export const useOnboardingState = () => {
  const { user } = useAuth();
  const { fetchOnboardingStatus, saveOnboardingStatus } = useSupabaseOnboarding();
  
  // Estados locais que são sincronizados com o estado global
  const [localState, setLocalState] = useState<OnboardingState>(globalOnboardingState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Listener para mudanças no estado global
  useEffect(() => {
    const listener = () => {
      console.log('Listener: Estado global mudou para:', globalOnboardingState);
      setLocalState({ ...globalOnboardingState });
      
      // Salvar no Supabase quando o estado mudar (se usuário logado)
      if (user && isInitialized) {
        saveOnboardingStatus(globalOnboardingState);
      }
    };
    
    stateListeners.add(listener);
    
    return () => {
      stateListeners.delete(listener);
    };
  }, [user, isInitialized, saveOnboardingStatus]);

  // Inicialização única no primeiro render
  useEffect(() => {
    const initializeOnboarding = async () => {
      console.log('=== INICIALIZANDO ONBOARDING ===');
      
      if (user) {
        console.log('Usuário logado - buscando progresso no Supabase');
        
        // Tentar buscar do Supabase primeiro
        const supabaseState = await fetchOnboardingStatus();
        
        if (supabaseState) {
          console.log('Estado encontrado no Supabase:', supabaseState);
          globalOnboardingState = supabaseState;
          setLocalState(supabaseState);
          setIsInitialized(true);
          return;
        }
        
        // Se não encontrou no Supabase, verificar localStorage para migração
        const localStorageState = localStorage.getItem(STORAGE_KEY);
        if (localStorageState) {
          try {
            const state: OnboardingState = JSON.parse(localStorageState);
            console.log('Migrando estado do localStorage para Supabase:', state);
            
            globalOnboardingState = state;
            setLocalState(state);
            
            // Salvar no Supabase e limpar localStorage
            await saveOnboardingStatus(state);
            localStorage.removeItem(STORAGE_KEY);
            setIsInitialized(true);
            return;
          } catch (error) {
            console.error('Erro ao migrar localStorage:', error);
          }
        }
        
        // Estado padrão para usuário logado sem progresso
        console.log('Primeira visita - criando novo progresso');
        const defaultState = {
          currentStep: 0,
          isCompleted: false,
          isSkipped: false,
          isWizardVisible: true
        };
        
        globalOnboardingState = defaultState;
        setLocalState(defaultState);
        await saveOnboardingStatus(defaultState);
        setIsInitialized(true);
        
      } else {
        console.log('Usuário não logado - usando localStorage');
        
        // Fallback para localStorage quando não logado
        const saved = localStorage.getItem(STORAGE_KEY);
        
        if (saved) {
          try {
            const state: OnboardingState = JSON.parse(saved);
            console.log('Estado salvo encontrado no localStorage:', state);
            
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
            console.error('Erro ao carregar estado do localStorage:', error);
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
          console.log('Primeira visita sem login - mostrando onboarding');
          const defaultState = {
            currentStep: 0,
            isCompleted: false,
            isSkipped: false,
            isWizardVisible: true
          };
          globalOnboardingState = defaultState;
          setLocalState(defaultState);
        }
        
        setIsInitialized(true);
      }
    };

    initializeOnboarding();
  }, [user, fetchOnboardingStatus, saveOnboardingStatus]);

  return localState;
};
