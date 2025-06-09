
import React from 'react';
import { Scissors, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';

export const StepServices: React.FC = () => {
  const navigate = useNavigate();
  const { hideWizard } = useOnboardingWizard();

  const handleGoToServices = () => {
    hideWizard();
    navigate('/dashboard/services');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <Scissors className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Cadastre seus Serviços</h3>
          <p className="text-gray-600">Adicione os serviços que você oferece</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700">
          Configure todos os serviços do seu negócio com preços, duração e descrições detalhadas.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Para cada serviço você pode definir:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Nome e descrição</li>
            <li>• Preço e duração</li>
            <li>• Quais funcionários podem executar</li>
            <li>• Se o serviço está ativo</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleGoToServices}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Gerenciar Serviços</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
