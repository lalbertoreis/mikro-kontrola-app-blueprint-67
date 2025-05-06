
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'kontrola-onboarding-dismissed';

export const OnboardingModal = () => {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Onboarding steps data
  const steps = [
    {
      title: "Bem-vindo ao KontrolaApp!",
      description: "Vamos configurar seu sistema em poucos passos",
      content: "Preparamos um guia rápido para você começar a usar o KontrolaApp com facilidade. Siga os passos para configurar seu sistema."
    },
    {
      title: "Serviços",
      description: "Cadastre os serviços que você oferece",
      content: "Comece cadastrando os serviços que você oferece ao seu cliente, incluindo duração, preço e descrição. Os serviços são a base do seu negócio.",
      link: "/dashboard/services"
    },
    {
      title: "Funcionários",
      description: "Adicione seus profissionais",
      content: "Cadastre os profissionais que trabalham em seu estabelecimento. Você pode atribuir serviços específicos para cada um deles.",
      link: "/dashboard/employees"
    },
    {
      title: "Agenda",
      description: "Configure sua agenda",
      content: "Defina horários de trabalho, serviços realizados por cada profissional e comece a gerenciar sua agenda de atendimentos.",
      link: "/dashboard/calendar"
    },
    {
      title: "Tudo pronto!",
      description: "Você está preparado para começar",
      content: "Seu sistema está configurado e pronto para uso. Agora você pode começar a receber agendamentos e gerenciar seu negócio com eficiência."
    }
  ];

  useEffect(() => {
    // Check if the user has already dismissed the onboarding
    const dismissed = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    }
    setOpen(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{currentStepData.title}</DialogTitle>
          <DialogDescription className="text-base">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">{currentStepData.content}</p>
            
            {currentStepData.link && (
              <Button variant="outline" asChild className="mt-4">
                <Link to={currentStepData.link}>
                  {isLastStep ? "Finalizar" : "Ir para esta seção"}
                </Link>
              </Button>
            )}
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          
          {isLastStep && (
            <div className="flex items-center space-x-2 mt-8">
              <Checkbox 
                id="dontShow" 
                checked={dontShowAgain} 
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              />
              <label htmlFor="dontShow" className="text-sm font-medium leading-none cursor-pointer">
                Não mostrar novamente
              </label>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          {!isFirstStep && (
            <Button variant="outline" onClick={prevStep}>
              Voltar
            </Button>
          )}
          <div className="flex-grow"></div>
          {isLastStep ? (
            <Button onClick={handleDismiss} className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Concluir
            </Button>
          ) : (
            <Button onClick={nextStep} className="flex items-center">
              Próximo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
