
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";

interface OnboardingSettingsProps {
  dontShowAgain: boolean;
  setDontShowAgain: (value: boolean) => void;
  isVisible: boolean;
}

const OnboardingSettings: React.FC<OnboardingSettingsProps> = ({
  dontShowAgain,
  setDontShowAgain,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
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
  );
};

export default OnboardingSettings;
