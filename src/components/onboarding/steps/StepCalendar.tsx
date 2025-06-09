
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';

export const StepCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { hideWizard } = useOnboardingWizard();

  const handleGoToCalendar = () => {
    hideWizard();
    navigate('/dashboard/calendar');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Agenda e Agendamentos</h3>
          <p className="text-gray-600">Configure sua agenda de trabalho</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700">
          Gerencie horários, visualize agendamentos e organize a agenda da sua equipe de forma eficiente.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Funcionalidades da agenda:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Visualização semanal e mensal</li>
            <li>• Criação rápida de agendamentos</li>
            <li>• Bloqueio de horários específicos</li>
            <li>• Filtros por funcionário</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleGoToCalendar}
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
