
import React, { useState } from "react";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import StepIndicator from "./StepIndicator";
import MobileEmployeeStep from "./mobile/MobileEmployeeStep";
import MobileDateStep from "./mobile/MobileDateStep";
import MobileTimeStep from "./mobile/MobileTimeStep";
import MobileSummaryStep from "./mobile/MobileSummaryStep";

interface MobileBookingStepsProps {
  service: Service;
  employees: Employee[];
  onBookingConfirm: (employeeId: string, date: Date, time: string) => void;
  themeColor?: string;
  businessSlug?: string;
}

const MobileBookingSteps: React.FC<MobileBookingStepsProps> = ({
  service,
  employees,
  onBookingConfirm,
  themeColor = "#9b87f5",
  businessSlug
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon" | "evening" | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const stepTitles = [
    "Escolha o profissional",
    "Escolha a data",
    "Escolha o período e horário",
    "Resumo do agendamento"
  ];

  const handleEmployeeNext = () => {
    if (selectedEmployee) {
      setCurrentStep(2);
    }
  };

  const handleDateNext = () => {
    if (selectedDate) {
      setCurrentStep(3);
    }
  };

  const handleTimeNext = () => {
    if (selectedPeriod && selectedTime) {
      setCurrentStep(4);
    }
  };

  const handleConfirm = () => {
    if (selectedEmployee && selectedDate && selectedTime) {
      onBookingConfirm(selectedEmployee.id, selectedDate, selectedTime);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MobileEmployeeStep
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={setSelectedEmployee}
            onNext={handleEmployeeNext}
            themeColor={themeColor}
          />
        );
      
      case 2:
        return (
          <MobileDateStep
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            serviceId={service.id}
            employeeId={selectedEmployee?.id || ""}
            onBack={() => setCurrentStep(1)}
            onNext={handleDateNext}
            themeColor={themeColor}
            businessSlug={businessSlug}
          />
        );
      
      case 3:
        return (
          <MobileTimeStep
            selectedDate={selectedDate!}
            selectedPeriod={selectedPeriod}
            selectedTime={selectedTime}
            onSelectPeriod={setSelectedPeriod}
            onSelectTime={setSelectedTime}
            serviceId={service.id}
            employeeId={selectedEmployee?.id || ""}
            onBack={() => setCurrentStep(2)}
            onNext={handleTimeNext}
            themeColor={themeColor}
            businessSlug={businessSlug}
          />
        );
      
      case 4:
        return (
          <MobileSummaryStep
            service={service}
            selectedEmployee={selectedEmployee!}
            selectedDate={selectedDate!}
            selectedTime={selectedTime!}
            onBack={() => setCurrentStep(3)}
            onContinue={handleConfirm}
            themeColor={themeColor}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <StepIndicator
        currentStep={currentStep}
        totalSteps={4}
        stepTitles={stepTitles}
        themeColor={themeColor}
      />
      
      <div className="pb-6">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default MobileBookingSteps;
