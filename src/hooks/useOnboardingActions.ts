
import { useOnboardingWizard } from './useOnboardingWizard';
import { useNavigate } from 'react-router-dom';

export const useOnboardingActions = () => {
  const { hideWizard } = useOnboardingWizard();
  const navigate = useNavigate();

  const navigateAndHideWizard = (path: string) => {
    console.log('=== AÇÃO: navigateAndHideWizard ===');
    console.log('Caminho:', path);
    
    // Esconder wizard IMEDIATAMENTE
    hideWizard();
    
    // Navegar após um pequeno delay
    setTimeout(() => {
      console.log('Navegando para:', path);
      navigate(path);
    }, 100);
  };

  return {
    navigateAndHideWizard,
    hideWizard
  };
};
