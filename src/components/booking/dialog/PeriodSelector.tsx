
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Period } from "./types";

interface PeriodSelectorProps {
  selectedPeriod: Period | null;
  onPeriodSelect: (period: Period) => void;
  availablePeriods?: Period[]; // Add this prop to filter available periods
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodSelect,
  availablePeriods = ["Manhã", "Tarde", "Noite"], // Default to all periods if not provided
}) => {
  // Filter periods based on availability
  const periodsToShow = (["Manhã", "Tarde", "Noite"] as Period[]).filter(
    (period) => availablePeriods.includes(period)
  );

  if (periodsToShow.length === 0) {
    return (
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-2">Nenhum período disponível para este dia.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <p className="text-sm text-gray-500 mb-2">Escolha o período:</p>
      <ToggleGroup 
        type="single" 
        className="justify-start" 
        value={selectedPeriod || ''} 
        onValueChange={value => value && onPeriodSelect(value as Period)}
      >
        {periodsToShow.map((period) => (
          <ToggleGroupItem key={period} value={period} className="px-4">
            {period}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default PeriodSelector;
