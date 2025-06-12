
import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const StepWelcome: React.FC = () => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-primary/20 dark:bg-primary/30 p-4 rounded-full">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Bem-vindo ao KontrolaApp!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Vamos configurar seu negócio em alguns passos simples. Este tutorial te guiará através das principais funcionalidades.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
          <ArrowRight className="w-5 h-5" />
          <span className="font-medium">Dica:</span>
        </div>
        <p className="text-blue-600 dark:text-blue-200 mt-1">
          Você pode pular este tutorial a qualquer momento, mas recomendamos seguir todos os passos para aproveitar melhor a plataforma.
        </p>
      </div>
    </div>
  );
};
