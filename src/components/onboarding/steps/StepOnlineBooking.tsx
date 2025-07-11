
import React, { useEffect, useState } from 'react';
import { Globe, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingActions } from '@/hooks/useOnboardingActions';
import { useProfileSettings } from '@/hooks/useProfileSettings';

export const StepOnlineBooking: React.FC = () => {
  const { navigateAndHideWizard } = useOnboardingActions();
  const { settings } = useProfileSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <Globe className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Agenda Online</h3>
          <p className="text-gray-600">Permita agendamentos online</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700">
          Configure sua página pública para que clientes possam agendar seus serviços online 24/7.
        </p>

        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Benefícios da agenda online:</h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li>• Agendamentos automáticos</li>
            <li>• Redução de ligações</li>
            <li>• Disponibilidade 24 horas</li>
            <li>• Link personalizado para compartilhar</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={() => {
              // Verificar se a agenda online está habilitada
              if (settings?.enableOnlineBooking) {
                // Se já estiver habilitada, ir direto para a tab online-booking
                navigateAndHideWizard('/dashboard/settings?tab=online-booking');
              } else {
                // Se não estiver habilitada, ir para a tab business para habilitar
                navigateAndHideWizard('/dashboard/settings?tab=business');
              }
            }}
            className="flex items-center space-x-2"
          >
            <Link className="w-4 h-4" />
            <span>Configurar Agenda Online</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
