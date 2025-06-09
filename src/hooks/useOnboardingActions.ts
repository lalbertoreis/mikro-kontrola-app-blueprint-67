
import { useOnboardingWizard } from './useOnboardingWizard';
import { useNavigate } from 'react-router-dom';

export const useOnboardingActions = () => {
  const { hideWizard } = useOnboardingWizard();
  const navigate = useNavigate();

  const navigateAndHideWizard = (path: string) => {
    console.log('Escondendo wizard e navegando para:', path);
    
    // Esconder o wizard imediatamente
    hideWizard();
    
    // Pequeno delay para garantir que o estado seja atualizado
    setTimeout(() => {
      navigate(path);
    }, 50);
  };

  return {
    navigateAndHideWizard,
    hideWizard
  };
};
