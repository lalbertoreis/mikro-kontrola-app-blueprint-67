
import React from "react";
import { BookingStep } from "./types";

interface DialogStepNavigatorProps {
  currentStep: BookingStep;
  setCurrentStep: (step: BookingStep) => void;
}

const DialogStepNavigator: React.FC<DialogStepNavigatorProps> = ({
  currentStep,
  setCurrentStep,
}) => {
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
};

export default DialogStepNavigator;
