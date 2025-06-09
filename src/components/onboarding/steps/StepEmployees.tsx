
import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';

export const StepEmployees: React.FC = () => {
  const navigate = useNavigate();
  const { hideWizard } = useOnboardingWizard();

  const handleGoToEmployees = () => {
    hideWizard();
    navigate('/dashboard/employees');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Adicione Funcionários</h3>
          <p className="text-gray-600">Cadastre sua equipe de trabalho</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700">
          Gerencie sua equipe definindo turnos, permissões e quais serviços cada funcionário pode realizar.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Para cada funcionário você pode configurar:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Nome, cargo e contatos</li>
            <li>• Turnos de trabalho por dia da semana</li>
            <li>• Quais serviços pode executar</li>
            <li>• Permissões de acesso ao sistema</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleGoToEmployees}
            className="flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Gerenciar Funcionários</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
