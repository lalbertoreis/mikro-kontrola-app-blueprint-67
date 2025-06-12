
import React from 'react';
import { Building2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingActions } from '@/hooks/useOnboardingActions';

export const StepBusinessInfo: React.FC = () => {
  const { navigateAndHideWizard } = useOnboardingActions();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 dark:bg-primary/30 p-3 rounded-full">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Informações do Negócio</h3>
          <p className="text-gray-600 dark:text-gray-300">Configure os dados básicos da sua empresa</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-200">
          Configure o nome da sua empresa, logo, informações de contato e outras configurações importantes para seu negócio.
        </p>

        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">O que você pode configurar:</h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li>• Nome e logo do negócio</li>
            <li>• Endereço e informações de contato</li>
            <li>• Redes sociais (Instagram, WhatsApp)</li>
            <li>• Configurações de agendamento online</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={() => navigateAndHideWizard('/dashboard/settings?tab=business')}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Ir para Configurações</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
