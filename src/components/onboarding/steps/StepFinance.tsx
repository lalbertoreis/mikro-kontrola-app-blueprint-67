
import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingActions } from '@/hooks/useOnboardingActions';

export const StepFinance: React.FC = () => {
  const { navigateAndHideWizard } = useOnboardingActions();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Controle Financeiro</h3>
          <p className="text-gray-600">Gerencie receitas e despesas</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700">
          Configure custos fixos, acompanhe seu faturamento e mantenha o controle total das finanças do seu negócio.
        </p>

        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Funcionalidades financeiras:</h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li>• Controle de receitas e despesas</li>
            <li>• Gestão de custos fixos</li>
            <li>• Relatórios financeiros</li>
            <li>• Acompanhamento mensal</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={() => navigateAndHideWizard('/dashboard/finance')}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Acessar Finanças</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
