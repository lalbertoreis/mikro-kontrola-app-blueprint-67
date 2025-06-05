
export interface OnboardingProgress {
  step_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface OnboardingSettings {
  dont_show_again: boolean;
  current_step_index: number;
  is_completed: boolean;
}
