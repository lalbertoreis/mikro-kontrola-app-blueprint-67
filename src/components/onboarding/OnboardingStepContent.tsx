
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { OnboardingStep } from './steps/OnboardingSteps';

interface OnboardingStepContentProps {
  step: OnboardingStep;
  currentStep: number;
}

const OnboardingStepContent: React.FC<OnboardingStepContentProps> = ({
  step,
  currentStep
}) => {
  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-2 text-primary">{step.title}</h2>
      <p className="text-lg text-muted-foreground mb-6">{step.description}</p>
      <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg mb-6">
        <p className="text-base">{step.content}</p>
      </div>
      
      {/* Step-specific interactive content */}
      <StepInteractiveContent step={step} />
    </motion.div>
  );
};

interface StepInteractiveContentProps {
  step: OnboardingStep;
}

const StepInteractiveContent: React.FC<StepInteractiveContentProps> = ({ step }) => {
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

export default OnboardingStepContent;
