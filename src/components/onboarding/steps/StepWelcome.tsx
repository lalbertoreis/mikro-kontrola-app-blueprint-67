
import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const StepWelcome: React.FC = () => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-primary/20 p-4 rounded-full">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">
          Bem-vindo ao KontrolaApp!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Vamos configurar seu negócio em alguns passos simples. Este tutorial te guiará através das principais funcionalidades.
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 text-blue-700">
          <ArrowRight className="w-5 h-5" />
          <span className="font-medium">Dica:</span>
        </div>
        <p className="text-blue-600 mt-1">
          Você pode pular este tutorial a qualquer momento, mas recomendamos seguir todos os passos para aproveitar melhor a plataforma.
        </p>
      </div>
    </div>
  );
};
