
import { OnboardingState } from './types';
import { STORAGE_KEY } from './constants';

export const loadOnboardingState = (): OnboardingState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Erro ao carregar estado do onboarding:', error);
    return null;
  }
};

export const saveOnboardingState = (state: OnboardingState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Erro ao salvar estado do onboarding:', error);
  }
};

export const clearOnboardingState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao limpar estado do onboarding:', error);
  }
};
