
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fetchAvailableTimeSlots } from "@/services/appointment/availability";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface TimeSlotSelectorProps {
  selectedDate: Date;
  period: "morning" | "afternoon" | "evening";
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  serviceId: string;
  employeeId: string;
  themeColor?: string;
  businessSlug?: string;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDate,
  period,
  selectedTime,
  onSelectTime,
  serviceId,
  employeeId,
  themeColor = "#9b87f5",
  businessSlug
}) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !serviceId || !employeeId) return;
      
      setIsLoading(true);
      
      try {
        // Format date as yyyy-MM-dd for the API
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        // Fetch available slots from the API - this now returns only truly available slots
        const allAvailableSlots = await fetchAvailableTimeSlots(
          employeeId,
          serviceId,
          formattedDate,
          businessSlug
        );
        
        // Filter slots based on selected period
        const filteredSlots = filterSlotsByPeriod(allAvailableSlots, period);
        
        setAvailableSlots(filteredSlots);
        
        // Clear selected time if it's no longer available
        if (selectedTime && !filteredSlots.includes(selectedTime)) {
          onSelectTime('');
        }
        
      } catch (error) {
        console.error("Error fetching available slots:", error);
        toast.error("Erro ao buscar horários disponíveis");
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSlots();
  }, [selectedDate, period, serviceId, employeeId, businessSlug, selectedTime, onSelectTime]);
  
  // Helper function to filter slots based on period
  const filterSlotsByPeriod = (slots: string[], period: string): string[] => {
    return slots.filter(time => {
      const hour = parseInt(time.split(':')[0]);
      
      if (period === "morning" && hour >= 5 && hour < 12) {
        return true;
      } else if (period === "afternoon" && hour >= 12 && hour < 18) {
        return true;
      } else if (period === "evening" && hour >= 18 && hour < 24) {
        return true;
      }
      return false;
    });
  };
  
  if (isLoading) {
    return (
      <div className="my-4">
        <p className="text-sm text-gray-600 mb-2">Carregando horários disponíveis...</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton 
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
      <p className="text-sm text-gray-600 mb-2">
        Horários disponíveis ({availableSlots.length} opções):
      </p>
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
