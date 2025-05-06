
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface TimeSlotSelectorProps {
  availableTimeSlots: string[];
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  period?: "morning" | "afternoon" | "evening";
  isLoading: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  availableTimeSlots,
  selectedTime,
  onTimeSelect,
  period,
  isLoading,
}) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">
        Horários disponíveis:
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : availableTimeSlots.length > 0 ? (
        <ScrollArea className="h-[180px]">
          <div className="grid grid-cols-3 gap-2">
            {availableTimeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => onTimeSelect(time)}
                className={`${
                  selectedTime === time 
                  ? "" 
                  : "hover:border-[color:var(--booking-color,theme(colors.primary))] hover:text-[color:var(--booking-color,theme(colors.primary))]"
                }`}
                style={{
                  backgroundColor: selectedTime === time ? 'var(--booking-color, var(--primary))' : ''
                }}
              >
                {time}
              </Button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex justify-center items-center h-20 text-sm text-muted-foreground">
          {period 
            ? "Nenhum horário disponível para este período"
            : "Nenhum horário disponível para esta data"}
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
