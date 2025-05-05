
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConfirmationScreenProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onClose: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  selectedDate,
  selectedTime,
  onClose,
}) => {
  // Detect platform to show appropriate calendar button
  const [platform, setPlatform] = React.useState<'ios' | 'android' | 'other'>('other');
  
  useEffect(() => {
    // Simple platform detection
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setPlatform('ios');
    } else {
      setPlatform('other');
    }
  }, []);
  
  const handleAddToCalendar = () => {
    if (!selectedDate || !selectedTime) return;
    
    // Format date and time for calendar
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const [hours, minutes] = selectedTime.split(':');
    
    // Create start date
    const startDate = new Date(`${dateStr}T${hours}:${minutes}:00`);
    
    // Create end date (1 hour later by default)
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    // Format for calendar URL
    const eventTitle = 'Seu Agendamento';
    const eventLocation = 'Local do Agendamento';
    const startIso = startDate.toISOString().replace(/-|:|\.\d+/g, '');
    const endIso = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    
    let calendarUrl = '';
    
    if (platform === 'ios') {
      // iOS Calendar format
      calendarUrl = `webcal://calendar.google.com/calendar/ical/addEvent?
        action=TEMPLATE&
        text=${encodeURIComponent(eventTitle)}&
        dates=${startIso}/${endIso}&
        location=${encodeURIComponent(eventLocation)}&
        details=${encodeURIComponent('Seu agendamento foi confirmado!')}`.replace(/\s+/g, '');
    } else {
      // Google Calendar format (works on Android and other platforms)
      calendarUrl = `https://calendar.google.com/calendar/render?
        action=TEMPLATE&
        text=${encodeURIComponent(eventTitle)}&
        dates=${startIso}/${endIso}&
        location=${encodeURIComponent(eventLocation)}&
        details=${encodeURIComponent('Seu agendamento foi confirmado!')}`.replace(/\s+/g, '');
    }
    
    // Open calendar in new tab
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-green-500 text-white flex items-center justify-center">
        <Check className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-green-500 text-center">RESERVA CONFIRMADA</h2>
      <p className="text-center font-semibold">
        {selectedDate && selectedTime && 
          format(selectedDate, "dd 'DE' MMM. 'DE' yyyy", { locale: ptBR }).toUpperCase() + ", " + selectedTime
        }
      </p>
      <p className="text-gray-500 text-center">Você não precisa fazer mais nada!</p>
      <div 
        className="flex items-center justify-center mt-4 cursor-pointer" 
        onClick={handleAddToCalendar}
      >
        <CalendarIcon className="h-5 w-5 text-green-500 mr-2" />
        <span className="text-green-500">
          {platform === 'ios' ? 'Adicionar ao Calendário' : 
           platform === 'android' ? 'Adicionar ao Google Agenda' : 
           'Adicionar ao Calendário'}
        </span>
      </div>
      <Button 
        className="w-full mt-4 bg-blue-500 hover:bg-blue-600" 
        onClick={onClose}
      >
        Ok, Entendi.
      </Button>
    </div>
  );
};

export default ConfirmationScreen;
