
import { useOnboardingWizard } from './useOnboardingWizard';
import { useNavigate } from 'react-router-dom';

export const useOnboardingActions = () => {
  const { hideWizard } = useOnboardingWizard();
  const navigate = useNavigate();

  const navigateAndHideWizard = (path: string) => {
    // Primeiro esconde o wizard
    hideWizard();
    
    // Pequeno delay para garantir que o estado seja atualizado
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  return {
    navigateAndHideWizard,
    hideWizard
  };
};
