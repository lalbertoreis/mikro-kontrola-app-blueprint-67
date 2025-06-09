
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/hooks/useServices';
import { useEmployees } from '@/hooks/useEmployees';
import { supabase } from '@/integrations/supabase/client';
import ServiceDialog from '@/components/services/ServiceDialog';
import EmployeeDialog from '@/components/employees/EmployeeDialog';

interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  route: string;
  buttonText: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'services',
    title: 'Cadastre seus Serviços',
    content: 'Adicione os serviços do seu negócio com preços, duração e outras configurações.',
    route: '/dashboard/services',
    buttonText: 'Cadastrar Serviço'
  },
  {
    id: 'employees',
    title: 'Adicione seus Funcionários',
    content: 'Adicione os profissionais que trabalham com você.',
    route: '/dashboard/employees',
    buttonText: 'Cadastrar Funcionário'
  },
  {
    id: 'clients',
    title: 'Cadastre seus Clientes',
    content: 'Cadastre seus clientes para facilitar o agendamento.',
    route: '/dashboard/clients',
    buttonText: 'Cadastrar Cliente'
  }
];

export const SimpleOnboarding: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { services } = useServices();
  const { employees } = useEmployees();
  
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar steps completos do banco
  useEffect(() => {
    if (!user) return;
    
    const loadCompletedSteps = async () => {
      try {
        const { data } = await supabase
          .from('onboarding_progress')
          .select('step_id')
          .eq('user_id', user.id)
          .eq('completed', true);
        
        if (data) {
          setCompletedSteps(data.map(item => item.step_id));
        }
      } catch (error) {
        console.error('Error loading completed steps:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedSteps();
  }, [user]);

  // Auto-detectar steps completos baseado nos dados
  useEffect(() => {
    if (loading || !user) return;

    const autoCompleteSteps = async () => {
      const newCompletedSteps = [...completedSteps];
      
      // Se tem serviços, marcar como completo
      if (services.length > 0 && !completedSteps.includes('services')) {
        await markStepCompleted('services');
        newCompletedSteps.push('services');
      }
      
      // Se tem funcionários, marcar como completo
      if (employees.length > 0 && !completedSteps.includes('employees')) {
        await markStepCompleted('employees');
        newCompletedSteps.push('employees');
      }
      
      setCompletedSteps(newCompletedSteps);
    };

    autoCompleteSteps();
  }, [services.length, employees.length, loading, user, completedSteps]);

  const markStepCompleted = async (stepId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          step_id: stepId,
          completed: true,
          completed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error marking step completed:', error);
    }
  };

  const handleSkip = async (stepId: string) => {
    await markStepCompleted(stepId);
    setCompletedSteps(prev => [...prev, stepId]);
  };

  const handleAction = (stepId: string) => {
    if (stepId === 'services') {
      setServiceDialogOpen(true);
    } else if (stepId === 'employees') {
      setEmployeeDialogOpen(true);
    }
  };

  const handleServiceCreated = async () => {
    setServiceDialogOpen(false);
    await markStepCompleted('services');
    setCompletedSteps(prev => [...prev, 'services']);
  };

  const handleEmployeeCreated = async () => {
    setEmployeeDialogOpen(false);
    await markStepCompleted('employees');
    setCompletedSteps(prev => [...prev, 'employees']);
  };

  // Encontrar step atual baseado na rota
  const currentStep = ONBOARDING_STEPS.find(step => step.route === location.pathname);
  
  // Não mostrar se não tem step para a página atual ou se já está completo
  if (!currentStep || completedSteps.includes(currentStep.id) || loading) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
                    {currentStep.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentStep.content}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => handleSkip(currentStep.id)}
                  className="flex items-center space-x-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Pular</span>
                </Button>
                
                <Button
                  onClick={() => handleAction(currentStep.id)}
                  className="bg-primary hover:bg-primary/90 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{currentStep.buttonText}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <ServiceDialog 
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        onServiceCreated={handleServiceCreated}
      />
      
      <EmployeeDialog 
        open={employeeDialogOpen}
        onOpenChange={setEmployeeDialogOpen}
        onEmployeeCreated={handleEmployeeCreated}
      />
    </>
  );
};
