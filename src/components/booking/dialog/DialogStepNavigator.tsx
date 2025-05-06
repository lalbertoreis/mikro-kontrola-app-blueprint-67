import React from "react";

interface DialogStepNavigatorProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isNextDisabled?: boolean;
  currentStep?: string;
  setCurrentStep?: (step: string) => void;
}

const DialogStepNavigator: React.FC<DialogStepNavigatorProps> = ({
  onNext,
  onPrevious,
  isNextDisabled = false,
  currentStep,
  setCurrentStep,
}) => {
  const handleNextClick = () => {
    if (onNext) onNext();
  };
  
  const handlePreviousClick = () => {
    if (onPrevious) onPrevious();
  };

  // If we're using the step navigator as part of a wizard UI
  if (currentStep && setCurrentStep) {
    return (
      <div className="flex justify-between items-center mb-4">
        <div
          className={`flex items-center ${
            currentStep === "datetime" ? "font-bold text-purple-600" : "text-gray-400"
          } cursor-pointer`}
          onClick={() => setCurrentStep("datetime")}
        >
          <div className={`rounded-full h-6 w-6 flex items-center justify-center mr-2 ${
            currentStep === "datetime" ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}>
            1
          </div>
          Data/Hora
        </div>
        
        <div className="h-0.5 flex-1 bg-gray-200 mx-2"></div>
        
        <div
          className={`flex items-center ${
            currentStep === "clientinfo" ? "font-bold text-purple-600" : "text-gray-400"
          } cursor-pointer`}
          onClick={() => currentStep === "clientinfo" && setCurrentStep("clientinfo")}
        >
          <div className={`rounded-full h-6 w-6 flex items-center justify-center mr-2 ${
            currentStep === "clientinfo" ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}>
            2
          </div>
          Seus dados
        </div>
        
        <div className="h-0.5 flex-1 bg-gray-200 mx-2"></div>
        
        <div
          className={`flex items-center ${
            currentStep === "confirmation" ? "font-bold text-purple-600" : "text-gray-400"
          }`}
        >
          <div className={`rounded-full h-6 w-6 flex items-center justify-center mr-2 ${
            currentStep === "confirmation" ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}>
            3
          </div>
          Confirmação
        </div>
      </div>
    );
  }
  
  // Otherwise, render a simple navigation footer with back/next buttons
  return (
    <div className="flex justify-between mt-6">
      <button
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
        onClick={handlePreviousClick}
        type="button"
      >
        Voltar
      </button>
      <button
        className="px-4 py-2 text-sm font-medium text-white bg-[color:var(--booking-color,#9b87f5)] border border-transparent rounded-md shadow-sm hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleNextClick}
        disabled={isNextDisabled}
        type="button"
      >
        Continuar
      </button>
    </div>
  );
};

export default DialogStepNavigator;
