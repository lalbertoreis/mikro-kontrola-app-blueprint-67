
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, addDays, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Period = "Manhã" | "Tarde" | "Noite";
type TimeSlot = string;

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service;
  employees: Employee[];
  onBookingConfirm: (data: {
    service: Service;
    employee: Employee;
    date: Date;
    time: string;
  }) => void;
}

const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onClose,
  service,
  employees,
  onBookingConfirm,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  // Generate week days (7 days from current week start)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    // Prevent going to past weeks
    const today = new Date();
    const newDate = addDays(currentWeekStart, -7);
    if (newDate < today) {
      setCurrentWeekStart(today);
    } else {
      setCurrentWeekStart(newDate);
    }
  };
  
  // Calculate max future date based on settings (default: 3 months)
  const maxFutureDate = addMonths(new Date(), 3);

  // Check if can go to next week
  const canGoNext = addDays(currentWeekStart, 7) <= maxFutureDate;

  // Check if can go to previous week
  const canGoPrevious = currentWeekStart > new Date();

  // Sample time slots based on selected period
  // In a real app, these would be dynamically generated based on employee availability
  const generateTimeSlots = (period: Period): TimeSlot[] => {
    // These are sample slots, in a real app you'd fetch these from backend
    // based on employee availability and service duration
    const slots: Record<Period, TimeSlot[]> = {
      "Manhã": ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
      "Tarde": ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"],
      "Noite": ["18:00", "18:30", "19:00", "19:30", "20:00"]
    };
    
    return slots[period];
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedPeriod(null);
    setSelectedTime(null);
  };

  const handlePeriodSelect = (period: Period) => {
    setSelectedPeriod(period);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: TimeSlot) => {
    setSelectedTime(time);
  };

  const handleBookingConfirm = () => {
    if (selectedEmployee && selectedDate && selectedTime) {
      onBookingConfirm({
        service,
        employee: selectedEmployee,
        date: selectedDate,
        time: selectedTime,
      });
      setBookingConfirmed(true);
    }
  };

  const resetDialog = () => {
    setSelectedEmployee(null);
    setSelectedDate(null);
    setSelectedPeriod(null);
    setSelectedTime(null);
    setBookingConfirmed(false);
    setCurrentWeekStart(new Date());
    onClose();
  };

  const formatDayOfWeek = (date: Date) => {
    return format(date, "EEEE", { locale: ptBR }).toUpperCase();
  };

  const formatDayOfMonth = (date: Date) => {
    return format(date, "dd");
  };
  
  // If dialog is closed, reset state
  useEffect(() => {
    if (!open) {
      resetDialog();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle>{service.name}</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {bookingConfirmed ? (
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
            <div className="flex items-center justify-center mt-4">
              <CalendarIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-500">Adicionar lembrete</span>
            </div>
            <Button 
              className="w-full mt-4 bg-blue-500 hover:bg-blue-600" 
              onClick={resetDialog}
            >
              Ok, Entendi.
            </Button>
          </div>
        ) : (
          <div className="p-4">
            {/* Service Info */}
            <div className="mb-6 border-b pb-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Duração</p>
                  <p className="font-medium">{service.duration} minutos</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(service.price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Employee Selection */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Escolha o profissional:</p>
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {employees.map((employee) => (
                  <Button
                    key={employee.id}
                    variant={selectedEmployee?.id === employee.id ? "default" : "outline"}
                    className={`whitespace-nowrap ${
                      selectedEmployee?.id === employee.id ? "bg-purple-500 hover:bg-purple-600" : ""
                    }`}
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    {employee.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPreviousWeek}
                  disabled={!canGoPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <p className="text-center text-gray-500">
                  {format(currentWeekStart, "MMMM yyyy", { locale: ptBR })}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextWeek}
                  disabled={!canGoNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 text-center">
                {weekDays.map((date, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500">{formatDayOfWeek(date).slice(0, 3)}</div>
                    <button
                      className={`w-10 h-10 rounded-lg mx-auto flex items-center justify-center text-lg ${
                        selectedDate && date.toDateString() === selectedDate.toDateString()
                          ? "bg-purple-500 text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleDateSelect(date)}
                    >
                      {formatDayOfMonth(date)}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Period Selection */}
            {selectedDate && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Escolha o período:</p>
                <ToggleGroup 
                  type="single" 
                  className="justify-start" 
                  value={selectedPeriod || ''} 
                  onValueChange={value => value && handlePeriodSelect(value as Period)}
                >
                  {(["Manhã", "Tarde", "Noite"] as Period[]).map((period) => (
                    <ToggleGroupItem key={period} value={period} className="px-4">
                      {period}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}

            {/* Time Slots */}
            {selectedDate && selectedPeriod && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Horários disponíveis:</p>
                <div className="grid grid-cols-4 gap-2">
                  {generateTimeSlots(selectedPeriod).map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      className={`${
                        selectedTime === time ? "bg-purple-500 hover:bg-purple-600" : ""
                      }`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Summary */}
            <div className="mt-8 space-y-2 border-t pt-4">
              <h3 className="font-semibold text-lg">Resumo do agendamento</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Serviço</p>
                  <p className="font-medium">{service.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-medium">
                    {selectedDate
                      ? format(selectedDate, "dd/MM/yyyy")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Horário</p>
                  <p className="font-medium">{selectedTime || "-"}</p>
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
                disabled={!selectedEmployee || !selectedDate || !selectedTime}
                onClick={handleBookingConfirm}
              >
                Agendar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
