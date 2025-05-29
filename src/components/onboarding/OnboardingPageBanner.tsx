
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import { useOnboarding } from './useOnboarding';

export const OnboardingPageBanner: React.FC = () => {
  const { nextStep, isOnboardingActive, getCurrentStepForPage } = useOnboarding();
  
  const stepForCurrentPage = getCurrentStepForPage();
  
  console.log('OnboardingPageBanner debug:', {
    isOnboardingActive,
    stepForCurrentPage,
    stepCompleted: stepForCurrentPage?.completed
  });
  
  // Only show if we're in onboarding mode, have a step for this page, and step is NOT completed
  if (!isOnboardingActive || !stepForCurrentPage || stepForCurrentPage.completed) {
    return null;
  }

  const handleCadastrar = () => {
    // The step completion will be detected automatically by useOnboarding
    // when the user creates the item, which will advance to next step
    console.log('Banner button clicked - waiting for step completion detection');
  };

  const handleAvancar = () => {
    console.log('Advancing to next step manually');
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">
                  {stepForCurrentPage.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {stepForCurrentPage.content}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleAvancar}
                className="flex items-center space-x-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Fazer depois</span>
              </Button>
              
              <Button
                onClick={handleCadastrar}
                className="bg-primary hover:bg-primary/90 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {stepForCurrentPage.id === 'services' ? 'Cadastrar Serviço' : 
                   stepForCurrentPage.id === 'employees' ? 'Cadastrar Funcionário' : 
                   'Cadastrar'}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
