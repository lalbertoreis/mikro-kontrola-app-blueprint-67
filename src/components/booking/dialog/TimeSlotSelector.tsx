
import React from "react";
import { Button } from "@/components/ui/button";

interface TimeSlotSelectorProps {
  availableTimeSlots: string[];
  selectedTime: string | null;
  isLoadingSlots: boolean;
  onTimeSelect: (time: string) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  availableTimeSlots,
  selectedTime,
  isLoadingSlots,
  onTimeSelect,
}) => {
  return (
    <div className="mb-6">
      <p className="text-sm text-gray-500 mb-2">Horários disponíveis:</p>
      {isLoadingSlots ? (
        <div className="text-center py-4">Carregando horários...</div>
      ) : availableTimeSlots.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {availableTimeSlots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? "default" : "outline"}
              className={`${
                selectedTime === time ? "bg-purple-500 hover:bg-purple-600" : ""
              }`}
              onClick={() => onTimeSelect(time)}
            >
              {time}
            </Button>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          Não há horários disponíveis para este período. 
          Tente outro período ou data.
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
