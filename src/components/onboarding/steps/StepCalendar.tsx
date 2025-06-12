
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingActions } from '@/hooks/useOnboardingActions';

export const StepCalendar: React.FC = () => {
  const { navigateAndHideWizard } = useOnboardingActions();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Agenda e Agendamentos</h3>
          <p className="text-gray-600 dark:text-gray-300">Configure sua agenda de trabalho</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-200">
          Gerencie horários, visualize agendamentos e organize a agenda da sua equipe de forma eficiente.
        </p>

        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Funcionalidades da agenda:</h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li>• Visualização semanal e mensal</li>
            <li>• Criação rápida de agendamentos</li>
            <li>• Bloqueio de horários específicos</li>
            <li>• Filtros por funcionário</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={() => navigateAndHideWizard('/dashboard/calendar')}
            className="flex items-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>Acessar Agenda</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
