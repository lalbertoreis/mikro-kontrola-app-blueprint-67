
import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimeSlotSelectorProps {
  selectedDate: Date;
  period: "morning" | "afternoon" | "evening";
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  serviceId: string;
  employeeId: string;
  themeColor?: string; // Add theme color prop
  businessSlug?: string;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDate,
  period,
  selectedTime,
  onSelectTime,
  serviceId,
  employeeId,
  themeColor = "#9b87f5", // Default color
  businessSlug
}) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate || !serviceId || !employeeId) return;
      
      setIsLoading(true);
      
      try {
        // In a real application, this would make an API call to get available slots
        // For this demo, we're just generating slots
        const mockSlots = generateMockTimeSlots(period);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setAvailableSlots(mockSlots);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvailableSlots();
  }, [selectedDate, period, serviceId, employeeId, businessSlug]);
  
  const generateMockTimeSlots = (period: string) => {
    let slots: string[] = [];
    
    if (period === "morning") {
      slots = ["08:00", "09:00", "10:00", "11:00", "11:30"];
    } else if (period === "afternoon") {
      slots = ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    } else if (period === "evening") {
      slots = ["19:00", "20:00", "21:00"];
    }
    
    return slots;
  };
  
  if (isLoading) {
    return (
      <div className="my-4">
        <p className="text-sm text-gray-600 mb-2">Carregando horários disponíveis...</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((item) => (
            <div 
              key={item} 
              className="w-20 h-10 bg-gray-200 animate-pulse rounded-md"
            />
          ))}
        </div>
      </div>
    );
  }
  
  if (availableSlots.length === 0) {
    return (
      <div className="my-4">
        <p className="text-sm text-red-500">
          Não há horários disponíveis para o período selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-600 mb-2">Horários disponíveis:</p>
      <div className="flex flex-wrap gap-2">
        {availableSlots.map((time) => (
          <button
            key={time}
            className={`py-2 px-4 rounded-md border transition-all ${
              selectedTime === time
                ? "text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            style={{ 
              backgroundColor: selectedTime === time ? themeColor : "transparent",
              borderColor: selectedTime === time ? themeColor : "#e5e7eb"
            }}
            onClick={() => onSelectTime(time)}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotSelector;
