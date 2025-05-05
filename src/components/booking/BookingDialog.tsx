import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, addDays, addMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { BusinessSettings } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkEmployeeAvailability, getEmployeeShiftHours, getEmployeeAvailableDays } from "@/services/appointment/utils";

type Period = "Manhã" | "Tarde" | "Noite";
type TimeSlot = string;
type BookingStep = "datetime" | "clientinfo" | "confirmation";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service;
  employees: Employee[];
  businessSettings?: BusinessSettings;
  onBookingConfirm: (data: {
    service: Service;
    employee: Employee;
    date: Date;
    time: string;
    clientInfo?: {
      name: string;
      phone: string;
    }
  }) => void;
}

const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onClose,
  service,
  employees,
  businessSettings,
  onBookingConfirm,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>("datetime");
  const [clientInfo, setClientInfo] = useState({ name: "", phone: "" });
  const [availableDays, setAvailableDays] = useState<{ [key: number]: boolean }>({});
  const [isLoadingDays, setIsLoadingDays] = useState(false);
  
  // Settings defaults
  const timeInterval = businessSettings?.bookingTimeInterval || 30;
  const futureLimit = businessSettings?.bookingFutureLimit || 3;

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
  
  // Calculate max future date based on settings
  const maxFutureDate = addMonths(new Date(), futureLimit);

  // Check if can go to next week
  const canGoNext = addDays(currentWeekStart, 7) <= maxFutureDate;

  // Check if can go to previous week
  const canGoPrevious = currentWeekStart > new Date();

  // Fetch employee's available days when employee is selected
  useEffect(() => {
    const fetchEmployeeAvailableDays = async () => {
      if (!selectedEmployee) return;
      
      setIsLoadingDays(true);
      try {
        // Get all available days for the employee
        const days = await getEmployeeAvailableDays(selectedEmployee.id);
        
        // Create a map of available days
        const availableDaysMap: { [key: number]: boolean } = {};
        
        // Initialize all days as unavailable
        for (let i = 0; i < 7; i++) {
          availableDaysMap[i] = days.includes(i);
        }
        
        setAvailableDays(availableDaysMap);
        console.log("Available days:", availableDaysMap);
      } catch (err) {
        console.error('Error in fetchEmployeeAvailableDays:', err);
      } finally {
        setIsLoadingDays(false);
      }
    };
    
    fetchEmployeeAvailableDays();
  }, [selectedEmployee]);

  // Create time slot intervals based on settings and employee shift
  const generateTimeIntervals = async (employee: Employee, date: Date, period: Period): Promise<TimeSlot[]> => {
    if (!employee || !date) return [];
    
    const dayOfWeek = date.getDay();
    
    // Get employee shift hours for this day
    const shiftHours = await getEmployeeShiftHours(employee.id, dayOfWeek);
    if (!shiftHours) return [];
    
    const { startTime: shiftStart, endTime: shiftEnd } = shiftHours;
    
    // Define period time ranges
    const periodRanges = {
      "Manhã": { start: "06:00", end: "12:00" },
      "Tarde": { start: "12:00", end: "18:00" },
      "Noite": { start: "18:00", end: "23:59" }
    };
    
    const periodRange = periodRanges[period];
    
    // Parse shift times to calculate overlap with period
    const [shiftStartHour, shiftStartMinute] = shiftStart.split(':').map(Number);
    const [shiftEndHour, shiftEndMinute] = shiftEnd.split(':').map(Number);
    const [periodStartHour, periodStartMinute] = periodRange.start.split(':').map(Number);
    const [periodEndHour, periodEndMinute] = periodRange.end.split(':').map(Number);
    
    // Convert to minutes for easier comparison
    const shiftStartInMinutes = shiftStartHour * 60 + shiftStartMinute;
    const shiftEndInMinutes = shiftEndHour * 60 + shiftEndMinute;
    const periodStartInMinutes = periodStartHour * 60 + periodStartMinute;
    const periodEndInMinutes = periodEndHour * 60 + periodEndMinute;
    
    // Find the overlap between shift and period
    const startMinutes = Math.max(shiftStartInMinutes, periodStartInMinutes);
    const endMinutes = Math.min(shiftEndInMinutes, periodEndInMinutes);
    
    // If there's no overlap, return empty array
    if (startMinutes >= endMinutes) return [];
    
    // Generate time slots within the overlap
    const slots: TimeSlot[] = [];
    const interval = timeInterval || 30; // Default to 30 minutes
    
    for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
      const hour = Math.floor(minutes / 60).toString().padStart(2, '0');
      const minute = (minutes % 60).toString().padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
    
    return slots;
  };

  // Fetch available time slots based on employee, service duration, and date
  const fetchAvailableTimeSlots = async (employee: Employee, date: Date, period: Period) => {
    if (!employee || !date || !period) return [];
    
    setIsLoadingSlots(true);
    
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Generate all potential time slots for this period
      const allPeriodSlots = await generateTimeIntervals(employee, date, period);
      
      if (allPeriodSlots.length === 0) {
        console.log("No time slots available in this period within employee's shift");
        return [];
      }
      
      // Use the service to fetch available slots considering existing appointments
      const availableSlots = await import("@/services/appointment").then(
        module => module.fetchAvailableTimeSlots(employee.id, service.id, formattedDate)
      );
      
      console.log("All period slots:", allPeriodSlots);
      console.log("Available slots from service:", availableSlots);
      
      // Filter slots that are both in the period and available according to appointments
      const finalAvailableSlots = allPeriodSlots.filter(slot => availableSlots.includes(slot));
      
      console.log("Final available slots:", finalAvailableSlots);
      
      return finalAvailableSlots;
    } catch (err) {
      console.error('Error in fetchAvailableTimeSlots:', err);
      return [];
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedDate(null);
    setSelectedPeriod(null);
    setSelectedTime(null);
    setAvailableTimeSlots([]);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedPeriod(null);
    setSelectedTime(null);
    setAvailableTimeSlots([]);
  };

  const handlePeriodSelect = async (period: Period) => {
    setSelectedPeriod(period);
    setSelectedTime(null);
    
    if (selectedEmployee && selectedDate) {
      const slots = await fetchAvailableTimeSlots(selectedEmployee, selectedDate, period);
      setAvailableTimeSlots(slots);
    }
  };

  const handleTimeSelect = (time: TimeSlot) => {
    setSelectedTime(time);
  };

  const handleClientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === "datetime") {
      setCurrentStep("clientinfo");
    } else if (currentStep === "clientinfo") {
      // Move to confirmation and trigger the callback with client info
      if (selectedEmployee && selectedDate && selectedTime) {
        onBookingConfirm({
          service,
          employee: selectedEmployee,
          date: selectedDate,
          time: selectedTime,
          clientInfo
        });
        setCurrentStep("confirmation");
        setBookingConfirmed(true);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "clientinfo") {
      setCurrentStep("datetime");
    }
  };

  const resetDialog = () => {
    setSelectedEmployee(null);
    setSelectedDate(null);
    setSelectedPeriod(null);
    setSelectedTime(null);
    setBookingConfirmed(false);
    setCurrentWeekStart(new Date());
    setAvailableTimeSlots([]);
    setCurrentStep("datetime");
    setClientInfo({ name: "", phone: "" });
    onClose();
  };

  const formatDayOfWeek = (date: Date) => {
    return format(date, "EEEE", { locale: ptBR }).toUpperCase();
  };

  const formatDayOfMonth = (date: Date) => {
    return format(date, "dd");
  };
  
  // Check if a day is available based on employee shifts
  const isDayAvailable = (date: Date) => {
    if (isLoadingDays || !selectedEmployee) return false;
    
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday
    return availableDays[dayOfWeek] === true;
  };
  
  // If dialog is closed, reset state
  useEffect(() => {
    if (!open) {
      resetDialog();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogContent className="sm:max-w-[650px] p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
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

        {currentStep === "confirmation" && bookingConfirmed ? (
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
        ) : currentStep === "clientinfo" ? (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Suas informações</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={clientInfo.name}
                  onChange={handleClientInfoChange}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={clientInfo.phone}
                  onChange={handleClientInfoChange}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={!clientInfo.name || !clientInfo.phone}
              >
                Confirmar Agendamento
              </Button>
            </div>
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
                {weekDays.map((date, index) => {
                  const isAvailable = isDayAvailable(date);
                  
                  return (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-500">{formatDayOfWeek(date).slice(0, 3)}</div>
                      <button
                        disabled={!isAvailable}
                        className={`w-10 h-10 rounded-lg mx-auto flex items-center justify-center text-lg ${
                          selectedDate && date.toDateString() === selectedDate.toDateString()
                            ? "bg-purple-500 text-white"
                            : !isAvailable
                              ? "opacity-30 cursor-not-allowed bg-gray-100"
                              : "hover:bg-gray-100"
                        }`}
                        onClick={() => isAvailable && handleDateSelect(date)}
                      >
                        {formatDayOfMonth(date)}
                      </button>
                    </div>
                  );
                })}
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
                        onClick={() => handleTimeSelect(time)}
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
                onClick={handleNextStep}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
