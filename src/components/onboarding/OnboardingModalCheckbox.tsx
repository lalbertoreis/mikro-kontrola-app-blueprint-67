
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface OnboardingModalCheckboxProps {
  dontShowAgain: boolean;
  onDontShowAgainChange: (checked: boolean) => void;
}

export const OnboardingModalCheckbox: React.FC<OnboardingModalCheckboxProps> = ({
  dontShowAgain,
  onDontShowAgainChange
}) => {
  return (
    <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
      <Checkbox
        id="dontShow"
        checked={dontShowAgain}
        onCheckedChange={(checked) => onDontShowAgainChange(checked === true)}
      />
      <label htmlFor="dontShow" className="text-sm text-gray-600 cursor-pointer">
        Não mostrar este tutorial novamente
      </label>
    </div>
  );
};
