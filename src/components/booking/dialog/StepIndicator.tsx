
import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  themeColor?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  themeColor = "#9b87f5"
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">
          Etapa {currentStep} de {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            backgroundColor: themeColor,
            width: `${(currentStep / totalSteps) * 100}%`
          }}
        />
      </div>
      
      <h2 className="text-xl font-bold" style={{ color: themeColor }}>
        {stepTitles[currentStep - 1]}
      </h2>
    </div>
  );
};

export default StepIndicator;
