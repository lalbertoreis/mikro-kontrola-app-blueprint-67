
import React from 'react';
import { CalendarX, CalendarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingActions } from '@/hooks/useOnboardingActions';

export const StepHolidays: React.FC = () => {
  const { navigateAndHideWizard, completeOnboarding } = useOnboardingActions();

  const handleManageHolidays = () => {
    // Marcar como completo antes de navegar para evitar re-abertura
    completeOnboarding();
    navigateAndHideWizard('/dashboard/holidays');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <CalendarX className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Feriados e Bloqueios</h3>
          <p className="text-gray-600">Configure datas especiais</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700">
          Defina feriados e bloqueios automáticos na agenda para evitar agendamentos em datas indisponíveis.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Tipos de bloqueios:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Feriados nacionais</li>
            <li>• Feriados locais</li>
            <li>• Bloqueios personalizados</li>
            <li>• Meio período (manhã/tarde)</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleManageHolidays}
            className="flex items-center space-x-2"
          >
            <CalendarOff className="w-4 w-4" />
            <span>Gerenciar Feriados</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
