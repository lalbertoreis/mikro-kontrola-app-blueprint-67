
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import { useOnboarding } from './useOnboarding';
import ServiceDialog from '@/components/services/ServiceDialog';
import EmployeeDialog from '@/components/employees/EmployeeDialog';

export const OnboardingPageBanner: React.FC = () => {
  const { advanceOnboarding, isOnboardingActive, getCurrentStepForPage, markStepCompleted } = useOnboarding();
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  
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
    console.log('Banner cadastrar button clicked for step:', stepForCurrentPage.id);
    if (stepForCurrentPage.id === 'services') {
      setServiceDialogOpen(true);
    } else if (stepForCurrentPage.id === 'employees') {
      setEmployeeDialogOpen(true);
    } else {
      // Para outros steps, apenas avançar
      handleAvancar();
    }
  };

  const handleAvancar = async () => {
    console.log('Advancing to next step manually (skip current step)');
    // Avançar para o próximo step SEM marcar o atual como completo
    await advanceOnboarding();
  };

  const handleServiceDialogClose = async (wasCreated: boolean) => {
    console.log('Service dialog closed, wasCreated:', wasCreated);
    setServiceDialogOpen(false);
    
    // Se um serviço foi criado, marcar step como completo e avançar automaticamente
    if (wasCreated) {
      console.log('Service created - marking step as completed and advancing to next step');
      await markStepCompleted(stepForCurrentPage.id);
      await advanceOnboarding();
    }
  };

  const handleEmployeeDialogClose = async (wasCreated: boolean) => {
    console.log('Employee dialog closed, wasCreated:', wasCreated);
    setEmployeeDialogOpen(false);
    
    // Se um funcionário foi criado, marcar step como completo e avançar automaticamente
    if (wasCreated) {
      console.log('Employee created - marking step as completed and advancing to next step');
      await markStepCompleted(stepForCurrentPage.id);
      await advanceOnboarding();
    }
  };

  const getButtonText = () => {
    switch (stepForCurrentPage.id) {
      case 'services':
        return 'Cadastrar Serviço';
      case 'employees':
        return 'Cadastrar Funcionário';
      case 'clients':
        return 'Cadastrar Cliente';
      case 'booking-settings':
        return 'Configurar';
      case 'calendar':
        return 'Ver Agenda';
      case 'holidays':
        return 'Configurar Feriados';
      case 'payment-methods':
        return 'Adicionar Método';
      case 'fixed-costs':
        return 'Adicionar Custo';
      case 'finance':
        return 'Ver Financeiro';
      default:
        return 'Cadastrar';
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
                  <span>Pular</span>
                </Button>
                
                <Button
                  onClick={handleCadastrar}
                  className="bg-primary hover:bg-primary/90 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{getButtonText()}</span>
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
          onOpenChange={(open) => !open && handleServiceDialogClose(false)}
          onServiceCreated={() => handleServiceDialogClose(true)}
        />
      )}

      {/* Employee Dialog */}
      {stepForCurrentPage.id === 'employees' && (
        <EmployeeDialog 
          open={employeeDialogOpen}
          onOpenChange={(open) => !open && handleEmployeeDialogClose(false)}
          onEmployeeCreated={() => handleEmployeeDialogClose(true)}
        />
      )}
    </>
  );
};
