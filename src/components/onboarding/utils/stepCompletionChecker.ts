
import { OnboardingState } from '../types';

interface CheckStepCompletionParams {
  state: OnboardingState;
  services: any[];
  employees: any[];
}

interface StepCompletionResult {
  hasChanges: boolean;
  shouldAdvance: boolean;
  updatedSteps: any[];
}

export const checkStepCompletion = ({
  state,
  services,
  employees
}: CheckStepCompletionParams): StepCompletionResult => {
  const updatedSteps = [...state.steps];
  let hasChanges = false;
  let shouldAdvance = false;

  // Check services step
  const servicesStep = updatedSteps.find(step => step.id === 'services');
  if (servicesStep && !servicesStep.completed && services.length > 0) {
    servicesStep.completed = true;
    hasChanges = true;
    
    // If we're currently on the services step, advance to next
    if (state.currentStepIndex === updatedSteps.findIndex(step => step.id === 'services')) {
      shouldAdvance = true;
    }
  }

  // Check employees step
  const employeesStep = updatedSteps.find(step => step.id === 'employees');
  if (employeesStep && !employeesStep.completed && employees.length > 0) {
    employeesStep.completed = true;
    hasChanges = true;
    
    // If we're currently on the employees step, advance to next
    if (state.currentStepIndex === updatedSteps.findIndex(step => step.id === 'employees')) {
      shouldAdvance = true;
    }
  }

  return { hasChanges, shouldAdvance, updatedSteps };
};

export const findNextIncompleteStep = (steps: any[], currentIndex: number) => {
  return steps.findIndex((step, index) => 
    index > currentIndex && !step.completed
  );
};

export const findFirstIncompleteStep = (steps: any[]) => {
  return steps.findIndex(step => !step.completed);
};
