
import { useOnboardingWizard } from './useOnboardingWizard';
import { useNavigate } from 'react-router-dom';

export const useOnboardingActions = () => {
  const { hideWizard } = useOnboardingWizard();
  const navigate = useNavigate();

  const navigateAndHideWizard = (path: string) => {
    console.log('=== AÇÃO: navigateAndHideWizard ===');
    console.log('Caminho:', path);
    
    // Esconder wizard IMEDIATAMENTE e de forma síncrona
    hideWizard();
    
    // Navegar imediatamente após esconder
    console.log('Navegando para:', path);
    navigate(path);
  };

  return {
    navigateAndHideWizard,
    hideWizard
  };
};
