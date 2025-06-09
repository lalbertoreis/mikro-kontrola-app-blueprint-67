
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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

export const OnboardingBanner: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Encontrar o step para a página atual
  const currentStep = ONBOARDING_STEPS.find(step => step.route === location.pathname);
  
  if (!currentStep || !user || !isVisible) {
    return null;
  }

  const handleSkip = async () => {
    try {
      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          step_id: currentStep.id,
          completed: true,
          completed_at: new Date().toISOString()
        });
      
      setIsVisible(false);
      toast.success('Etapa marcada como concluída');
    } catch (error) {
      console.error('Erro ao pular etapa:', error);
      toast.error('Erro ao pular etapa');
    }
  };

  const handleAction = () => {
    if (currentStep.id === 'services') {
      setServiceDialogOpen(true);
    } else if (currentStep.id === 'employees') {
      setEmployeeDialogOpen(true);
    } else {
      // Para clientes, apenas marca como concluído
      handleSkip();
    }
  };

  const handleServiceCreated = async () => {
    setServiceDialogOpen(false);
    try {
      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          step_id: 'services',
          completed: true,
          completed_at: new Date().toISOString()
        });
      
      setIsVisible(false);
      toast.success('Serviço criado e etapa concluída!');
    } catch (error) {
      console.error('Erro ao marcar etapa como concluída:', error);
    }
  };

  const handleEmployeeCreated = async () => {
    setEmployeeDialogOpen(false);
    try {
      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          step_id: 'employees',
          completed: true,
          completed_at: new Date().toISOString()
        });
      
      setIsVisible(false);
      toast.success('Funcionário criado e etapa concluída!');
    } catch (error) {
      console.error('Erro ao marcar etapa como concluída:', error);
    }
  };

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
                  onClick={handleSkip}
                  className="flex items-center space-x-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Pular</span>
                </Button>
                
                <Button
                  onClick={handleAction}
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
