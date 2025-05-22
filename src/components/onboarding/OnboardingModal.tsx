
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { useOnboarding } from './useOnboarding';
import { onboardingStyles } from './TargetElementHighlighter';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { OnboardingStep } from './steps/OnboardingSteps';
import { Link } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";

export const OnboardingModal = () => {
  const { loading } = useAuth();
  const {
    open,
    setOpen,
    dontShowAgain,
    setDontShowAgain,
    currentStep,
    currentStepData,
    totalSteps,
    nextStep,
    prevStep,
    handleDismiss
  } = useOnboarding();

  // Don't render anything if still loading auth state
  if (loading) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-primary/20 border-0">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
            
            {/* Content container */}
            <div className="p-6 relative z-10">
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-muted-foreground">
                  Passo {currentStep + 1} de {totalSteps}
                </div>
                <div className="flex space-x-1.5">
                  {Array.from({ length: totalSteps }).map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`h-1.5 rounded-full ${
                        idx === currentStep ? "bg-primary w-6" : "bg-muted w-2"
                      }`}
                      animate={{ 
                        backgroundColor: idx === currentStep ? "var(--primary)" : "var(--muted)",
                        width: idx === currentStep ? 24 : 8
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Main content */}
              <div className="space-y-6">
                <motion.div
                  key={currentStep} // This forces re-animation when step changes
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-bold mb-2 text-primary">{currentStepData.title}</h2>
                  <p className="text-lg text-muted-foreground mb-6">{currentStepData.description}</p>
                  <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg mb-6">
                    <p className="text-base">{currentStepData.content}</p>
                  </div>
                  
                  {/* Step-specific content */}
                  <StepContent step={currentStepData} />
                </motion.div>
                
                {/* Don't show again option */}
                {currentStep === totalSteps - 1 && (
                  <div className="flex items-center space-x-2 pt-2">
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
                
                {/* Navigation buttons */}
                <div className="flex justify-between pt-6">
                  {currentStep > 0 ? (
                    <Button variant="outline" onClick={prevStep} className="gap-2">
                      <ChevronLeft className="h-4 w-4" /> 
                      Anterior
                    </Button>
                  ) : <div />}
                  
                  {currentStep === totalSteps - 1 ? (
                    <Button onClick={handleDismiss} className="gap-2 bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-4 w-4" /> 
                      Concluir
                    </Button>
                  ) : (
                    <Button onClick={nextStep} className="gap-2">
                      Próximo 
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add the global styles */}
      <style dangerouslySetInnerHTML={{ __html: onboardingStyles }} />
    </>
  );
};

interface StepContentProps {
  step: OnboardingStep;
}

const StepContent: React.FC<StepContentProps> = ({ step }) => {
  if (!step.requiresClick && step.route) {
    return (
      <div className="flex justify-center">
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
        >
          <Button asChild variant="outline" className="bg-white/50 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300">
            <Link to={step.route}>
              Ir para esta seção agora
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }
  
  if (step.requiresClick && step.targetSelector) {
    return (
      <div className="flex justify-center">
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg text-center">
          <p className="text-sm font-medium">Clique no elemento indicado pela seta pulsante</p>
        </div>
      </div>
    );
  }
  
  return null;
};
