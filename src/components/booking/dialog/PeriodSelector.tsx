
import React from "react";

interface PeriodSelectorProps {
  selectedPeriod: "morning" | "afternoon" | "evening" | null;
  onSelectPeriod: (period: "morning" | "afternoon" | "evening") => void;
  themeColor?: string; // Add theme color prop
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ 
  selectedPeriod, 
  onSelectPeriod,
  themeColor = "#9b87f5" // Default color
}) => {
  const periods = [
    { id: "morning", label: "Manhã" },
    { id: "afternoon", label: "Tarde" },
  ];

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-600 mb-2">Escolha o período:</p>
      <div className="flex gap-2">
        {periods.map((period) => (
          <button
            key={period.id}
            className={`py-2 px-4 rounded-md border transition-all ${
              selectedPeriod === period.id
                ? "text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            style={{ 
              backgroundColor: selectedPeriod === period.id ? themeColor : "transparent",
              borderColor: selectedPeriod === period.id ? themeColor : "#e5e7eb" 
            }}
            onClick={() => onSelectPeriod(period.id as "morning" | "afternoon" | "evening")}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodSelector;
