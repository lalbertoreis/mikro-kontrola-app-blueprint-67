
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Period = "Manhã" | "Tarde" | "Noite";

interface PeriodSelectorProps {
  selectedPeriod: Period | null;
  onPeriodSelect: (period: Period) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodSelect,
}) => {
  return (
    <div className="mb-6">
      <p className="text-sm text-gray-500 mb-2">Escolha o período:</p>
      <ToggleGroup 
        type="single" 
        className="justify-start" 
        value={selectedPeriod || ''} 
        onValueChange={value => value && onPeriodSelect(value as Period)}
      >
        {(["Manhã", "Tarde", "Noite"] as Period[]).map((period) => (
          <ToggleGroupItem key={period} value={period} className="px-4">
            {period}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default PeriodSelector;
