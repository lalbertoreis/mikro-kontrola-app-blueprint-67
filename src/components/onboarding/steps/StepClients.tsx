
import React from 'react';
import { UserCheck, ContactRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingActions } from '@/hooks/useOnboardingActions';

export const StepClients: React.FC = () => {
  const { navigateAndHideWizard } = useOnboardingActions();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <UserCheck className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Gestão de Clientes</h3>
          <p className="text-gray-600">Organize sua base de clientes</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700">
          Cadastre e gerencie seus clientes com informações detalhadas e histórico completo de atendimentos.
        </p>

        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Informações que você pode gerenciar:</h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li>• Dados pessoais e contatos</li>
            <li>• Endereço completo</li>
            <li>• Histórico de agendamentos</li>
            <li>• Observações e preferências</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={() => navigateAndHideWizard('/dashboard/clients')}
            className="flex items-center space-x-2"
          >
            <ContactRound className="w-4 h-4" />
            <span>Gerenciar Clientes</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
