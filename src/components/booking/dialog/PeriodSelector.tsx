
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type PeriodType = "morning" | "afternoon" | "evening";

interface PeriodSelectorProps {
  selectedPeriod: PeriodType | null | undefined;
  onPeriodSelect: (period: PeriodType) => void;
  availablePeriods?: PeriodType[]; // Add this prop to filter available periods
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodSelect,
  availablePeriods = ["morning", "afternoon", "evening"], // Default to all periods if not provided
}) => {
  // Map internal period types to display labels
  const periodLabels = {
    "morning": "Manhã",
    "afternoon": "Tarde",
    "evening": "Noite"
  };

  // Filter periods based on availability
  const periodsToShow = (["morning", "afternoon", "evening"] as PeriodType[]).filter(
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
        onValueChange={value => value && onPeriodSelect(value as PeriodType)}
      >
        {periodsToShow.map((period) => (
          <ToggleGroupItem key={period} value={period} className="px-4">
            {periodLabels[period]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default PeriodSelector;
