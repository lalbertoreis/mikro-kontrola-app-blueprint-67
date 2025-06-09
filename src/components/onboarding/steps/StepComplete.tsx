
import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';

export const StepComplete: React.FC = () => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">
          Configuração Concluída!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Parabéns! Seu negócio está configurado e pronto para começar. Agora você pode aproveitar todas as funcionalidades da plataforma.
        </p>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center justify-center space-x-2 text-green-700">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Próximos passos:</span>
        </div>
        <ul className="text-green-600 mt-2 space-y-1">
          <li>• Explore o dashboard principal</li>
          <li>• Comece a agendar seus primeiros clientes</li>
          <li>• Configure sua agenda online</li>
        </ul>
      </div>
    </div>
  );
};
