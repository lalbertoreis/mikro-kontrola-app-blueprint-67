
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import { useOnboarding } from './useOnboarding';
import ServiceDialog from '@/components/services/ServiceDialog';

export const OnboardingPageBanner: React.FC = () => {
  const { nextStep, reopenModal, isOnboardingActive, getCurrentStepForPage, markStepCompleted } = useOnboarding();
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  
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
    // Abrir modal de cadastro específico para o step atual
    console.log('Banner cadastrar button clicked - opening service dialog');
    if (stepForCurrentPage.id === 'services') {
      setServiceDialogOpen(true);
    } else if (stepForCurrentPage.id === 'employees') {
      // TODO: Implementar quando tiver a página de funcionários
      console.log('Employee registration not implemented yet');
    }
  };

  const handleAvancar = async () => {
    console.log('Advancing to next step manually and marking current step as completed');
    // Marcar o step atual como completo antes de avançar
    await markStepCompleted(stepForCurrentPage.id);
    nextStep();
  };

  const handleServiceDialogClose = async (wasCreated: boolean) => {
    setServiceDialogOpen(false);
    
    // Se um serviço foi criado, marcar step como completo e avançar automaticamente
    if (wasCreated) {
      console.log('Service created - marking step as completed and advancing to next step');
      await markStepCompleted(stepForCurrentPage.id);
      nextStep();
    }
  };

  return (
    <>
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

      {/* Service Dialog */}
      {stepForCurrentPage.id === 'services' && (
        <ServiceDialog 
          open={serviceDialogOpen}
          onOpenChange={(open) => handleServiceDialogClose(!open)}
          onServiceCreated={() => handleServiceDialogClose(true)}
        />
      )}
    </>
  );
};
