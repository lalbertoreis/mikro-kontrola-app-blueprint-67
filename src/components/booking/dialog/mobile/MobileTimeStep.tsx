
import React from "react";
import { Button } from "@/components/ui/button";
import PeriodSelector from "../PeriodSelector";
import TimeSlotSelector from "../TimeSlotSelector";

interface MobileTimeStepProps {
  selectedDate: Date;
  selectedPeriod: "morning" | "afternoon" | "evening" | null;
  selectedTime: string | null;
  onSelectPeriod: (period: "morning" | "afternoon" | "evening") => void;
  onSelectTime: (time: string) => void;
  serviceId: string;
  employeeId: string;
  onBack: () => void;
  onNext: () => void;
  themeColor?: string;
  businessSlug?: string;
}

const MobileTimeStep: React.FC<MobileTimeStepProps> = ({
  selectedDate,
  selectedPeriod,
  selectedTime,
  onSelectPeriod,
  onSelectTime,
  serviceId,
  employeeId,
  onBack,
  onNext,
  themeColor = "#9b87f5",
  businessSlug
}) => {
  return (
    <div className="space-y-6">
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onSelectPeriod={onSelectPeriod}
        themeColor={themeColor}
      />

      {selectedPeriod && (
        <TimeSlotSelector
          selectedDate={selectedDate}
          period={selectedPeriod}
          selectedTime={selectedTime}
          onSelectTime={onSelectTime}
          serviceId={serviceId}
          employeeId={employeeId}
          themeColor={themeColor}
          businessSlug={businessSlug}
        />
      )}

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onBack}
        >
          Voltar
        </Button>
        <Button
          className="flex-1 text-white"
          disabled={!selectedPeriod || !selectedTime}
          onClick={onNext}
          style={{ backgroundColor: themeColor }}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default MobileTimeStep;
