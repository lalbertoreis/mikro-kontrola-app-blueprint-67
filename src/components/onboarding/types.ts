
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: string;
  targetSelector?: string;
  route?: string;
  completed: boolean;
}

export interface OnboardingState {
  isOpen: boolean;
  currentStepIndex: number;
  steps: OnboardingStep[];
  canSkip: boolean;
  dontShowAgain: boolean;
}
