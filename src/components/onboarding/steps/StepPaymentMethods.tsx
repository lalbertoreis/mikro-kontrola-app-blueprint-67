
import React from 'react';
import { CreditCard, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingActions } from '@/hooks/useOnboardingActions';

export const StepPaymentMethods: React.FC = () => {
  const { navigateAndHideWizard } = useOnboardingActions();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Métodos de Pagamento</h3>
          <p className="text-gray-600">Configure formas de pagamento</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700">
          Defina quais métodos de pagamento você aceita e facilite o processo de cobrança.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Métodos disponíveis:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Dinheiro</li>
            <li>• Cartão de débito/crédito</li>
            <li>• PIX</li>
            <li>• Transferência bancária</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={() => navigateAndHideWizard('/dashboard/payment-methods')}
            className="flex items-center space-x-2"
          >
            <DollarSign className="w-4 h-4" />
            <span>Configurar Pagamentos</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
