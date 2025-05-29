
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
  newCurrentStepIndex?: number;
}

export const checkStepCompletion = ({
  state,
  services,
  employees
}: CheckStepCompletionParams): StepCompletionResult => {
  console.log('checkStepCompletion called with:', {
    currentStepIndex: state.currentStepIndex,
    servicesCount: services.length,
    employeesCount: employees.length,
    currentStepId: state.steps[state.currentStepIndex]?.id
  });

  const updatedSteps = [...state.steps];
  let hasChanges = false;
  let shouldAdvance = false;
  let newCurrentStepIndex = state.currentStepIndex;

  // Check services step
  const servicesStep = updatedSteps.find(step => step.id === 'services');
  const servicesStepIndex = updatedSteps.findIndex(step => step.id === 'services');
  
  if (servicesStep && !servicesStep.completed && services.length > 0) {
    console.log('Marking services step as completed');
    servicesStep.completed = true;
    hasChanges = true;
    
    // If we're currently on the services step, advance to employees step
    if (state.currentStepIndex === servicesStepIndex) {
      console.log('Currently on services step, advancing to employees step');
      const employeesStepIndex = updatedSteps.findIndex(step => step.id === 'employees');
      if (employeesStepIndex !== -1) {
        newCurrentStepIndex = employeesStepIndex;
        shouldAdvance = true;
      }
    }
  }

  // Check employees step
  const employeesStep = updatedSteps.find(step => step.id === 'employees');
  const employeesStepIndex = updatedSteps.findIndex(step => step.id === 'employees');
  
  if (employeesStep && !employeesStep.completed && employees.length > 0) {
    console.log('Marking employees step as completed');
    employeesStep.completed = true;
    hasChanges = true;
    
    // If we're currently on the employees step, advance to calendar step
    if (state.currentStepIndex === employeesStepIndex) {
      console.log('Currently on employees step, advancing to calendar step');
      const calendarStepIndex = updatedSteps.findIndex(step => step.id === 'calendar');
      if (calendarStepIndex !== -1) {
        newCurrentStepIndex = calendarStepIndex;
        shouldAdvance = true;
      }
    }
  }

  console.log('checkStepCompletion result:', { hasChanges, shouldAdvance, newCurrentStepIndex });
  return { hasChanges, shouldAdvance, updatedSteps, newCurrentStepIndex };
};

export const findNextIncompleteStep = (steps: any[], currentIndex: number) => {
  const nextIndex = steps.findIndex((step, index) => 
    index > currentIndex && !step.completed
  );
  console.log('findNextIncompleteStep:', { currentIndex, nextIndex });
  return nextIndex;
};

export const findFirstIncompleteStep = (steps: any[]) => {
  const firstIndex = steps.findIndex(step => !step.completed);
  console.log('findFirstIncompleteStep:', firstIndex);
  return firstIndex;
};
