
import React from "react";
import { Button } from "@/components/ui/button";
import BookingCalendar from "../BookingCalendar";

interface MobileDateStepProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  serviceId: string;
  employeeId: string;
  onBack: () => void;
  onNext: () => void;
  themeColor?: string;
  businessSlug?: string;
}

const MobileDateStep: React.FC<MobileDateStepProps> = ({
  selectedDate,
  onDateSelect,
  serviceId,
  employeeId,
  onBack,
  onNext,
  themeColor = "#9b87f5",
  businessSlug
}) => {
  return (
    <div className="space-y-6">
      <BookingCalendar
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        serviceId={serviceId}
        employeeId={employeeId}
        themeColor={themeColor}
        businessSlug={businessSlug}
      />

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
          disabled={!selectedDate}
          onClick={onNext}
          style={{ backgroundColor: themeColor }}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default MobileDateStep;
