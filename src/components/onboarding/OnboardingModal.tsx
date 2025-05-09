
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
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2, ArrowDown } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'kontrola-onboarding-dismissed';

export const OnboardingModal = () => {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  // Onboarding steps data with target elements and routes
  const steps = [
    {
      title: "Bem-vindo ao KontrolaApp!",
      description: "Guia interativo para começar",
      content: "Preparamos um guia interativo para você configurar seu sistema em poucos passos. Siga as instruções e clique nos elementos indicados.",
      targetSelector: null,
      requiresClick: false,
      route: null
    },
    {
      title: "Serviços",
      description: "Cadastre os serviços que você oferece",
      content: "Clique no menu Serviços para cadastrar os serviços que você oferece ao seu cliente, incluindo duração, preço e descrição.",
      targetSelector: "[data-menu='services']",
      requiresClick: true,
      route: "/dashboard/services"
    },
    {
      title: "Funcionários",
      description: "Adicione seus profissionais",
      content: "Agora clique no menu Funcionários para cadastrar os profissionais que trabalham em seu estabelecimento.",
      targetSelector: "[data-menu='employees']",
      requiresClick: true,
      route: "/dashboard/employees"
    },
    {
      title: "Agenda",
      description: "Configure sua agenda",
      content: "Por último, clique no menu Agenda para configurar seus horários de trabalho e começar a gerenciar seus atendimentos.",
      targetSelector: "[data-menu='calendar']",
      requiresClick: true,
      route: "/dashboard/calendar"
    },
    {
      title: "Tudo pronto!",
      description: "Você está preparado para começar",
      content: "Parabéns! Seu sistema está configurado e pronto para uso. Agora você pode começar a receber agendamentos e gerenciar seu negócio com eficiência.",
      targetSelector: null,
      requiresClick: false,
      route: null
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
      const nextStepData = steps[currentStep + 1];
      
      if (nextStepData.requiresClick) {
        // For steps requiring click, just highlight the target element but don't advance
        highlightTargetElement(nextStepData.targetSelector);
      } else {
        // For steps not requiring click, advance to next step
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Function to highlight a target element with a pulsing arrow
  const highlightTargetElement = (selector) => {
    if (!selector) return;
    
    // Remove any existing highlights
    const existingHighlight = document.querySelector('.onboarding-highlight');
    if (existingHighlight) {
      existingHighlight.remove();
    }

    // Find the target element
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      // Create highlight element
      const highlight = document.createElement('div');
      highlight.className = 'onboarding-highlight fixed z-50 animate-pulse';
      
      // Position the highlight near the target element
      const rect = targetElement.getBoundingClientRect();
      highlight.style.top = `${rect.top + rect.height}px`;
      highlight.style.left = `${rect.left + rect.width / 2 - 10}px`;
      
      // Create arrow element
      const arrow = document.createElement('div');
      arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="m6 9 6 6 6-6"/></svg>`;
      
      highlight.appendChild(arrow);
      document.body.appendChild(highlight);
      
      // Add click listener to the target element
      const currentStepIndex = currentStep;
      const handleTargetClick = () => {
        // Remove highlight
        highlight.remove();
        
        // Navigate to the route if specified
        const step = steps[currentStepIndex + 1];
        if (step && step.route) {
          navigate(step.route);
        }
        
        // Advance to next step after a small delay to allow navigation
        setTimeout(() => {
          setCurrentStep(currentStepIndex + 1);
        }, 500);
        
        // Remove this event listener
        targetElement.removeEventListener('click', handleTargetClick);
      };
      
      targetElement.addEventListener('click', handleTargetClick);
    }
  };

  // On mount and when step changes, check if we need to highlight an element
  useEffect(() => {
    const currentStepData = steps[currentStep];
    if (currentStepData && currentStepData.targetSelector) {
      // Short delay to ensure the DOM is ready
      const timer = setTimeout(() => {
        highlightTargetElement(currentStepData.targetSelector);
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // Cleanup function to remove any highlights when component unmounts or step changes
    return () => {
      const existingHighlight = document.querySelector('.onboarding-highlight');
      if (existingHighlight) {
        existingHighlight.remove();
      }
    };
  }, [currentStep]);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
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
              
              {/* Only show buttons for navigation when not requiring clicks */}
              {!currentStepData.requiresClick && currentStepData.route && (
                <Button variant="outline" asChild className="mt-4">
                  <Link to={currentStepData.route}>
                    Ir para esta seção
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
      
      {/* Add the global styles using style element without jsx or global props */}
      <style dangerouslySetInnerHTML={{ __html: `
        .onboarding-highlight {
          color: var(--kontrola-600, #6c63ff);
          filter: drop-shadow(0 0 8px rgba(108, 99, 255, 0.5));
          pointer-events: none;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      ` }} />
    </>
  );
};

