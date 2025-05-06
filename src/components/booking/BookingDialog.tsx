import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, addDays, addMonths } from "date-fns";
import { X } from "lucide-react";
import { checkEmployeeAvailability, getEmployeeShiftHours, getEmployeeAvailableDays } from "@/services/appointment/utils";
import { BookingStep, Period, TimeSlot } from "./dialog/types";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import { BusinessSettings } from "@/types/settings";

// Import all the components we extracted
import ServiceInfo from "./dialog/ServiceInfo";
import EmployeeSelector from "./dialog/EmployeeSelector";
import BookingCalendar from "./dialog/BookingCalendar";
import PeriodSelector from "./dialog/PeriodSelector";
import TimeSlotSelector from "./dialog/TimeSlotSelector";
import BookingSummary from "./dialog/BookingSummary";
import ClientInfoForm from "./dialog/ClientInfoForm";
import ConfirmationScreen from "./dialog/ConfirmationScreen";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service;
  employees: Employee[];
  businessSettings: BusinessSettings | null;
  onBookingConfirm: (data: any) => void;
  bookingSettings?: {
    simultaneousLimit: number;
    futureLimit: number;
    cancelMinHours: number;
  };
}

const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onClose,
  service,
  employees,
  businessSettings,
  onBookingConfirm,
  bookingSettings
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
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
  const [availablePeriods, setAvailablePeriods] = useState<Period[]>(["Manhã", "Tarde", "Noite"]);
  
  // Utilizar os limites do bookingSettings, ou valores padrão
  const timeInterval = businessSettings?.bookingTimeInterval || 30;
  const futureLimit = bookingSettings?.futureLimit || businessSettings?.bookingFutureLimit || 3;
  
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

  // Check available periods for a date
  const checkAvailablePeriods = async (employee: any, date: Date) => {
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
    
    // Parse shift times to calculate overlap with periods
    const [shiftStartHour, shiftStartMinute] = shiftStart.split(':').map(Number);
    const [shiftEndHour, shiftEndMinute] = shiftEnd.split(':').map(Number);
    
    // Convert to minutes for easier comparison
    const shiftStartInMinutes = shiftStartHour * 60 + shiftStartMinute;
    const shiftEndInMinutes = shiftEndHour * 60 + shiftEndMinute;
    
    // Check which periods overlap with the shift
    const available: Period[] = [];
    
    Object.entries(periodRanges).forEach(([period, range]) => {
      const [periodStartHour, periodStartMinute] = range.start.split(':').map(Number);
      const [periodEndHour, periodEndMinute] = range.end.split(':').map(Number);
      
      const periodStartInMinutes = periodStartHour * 60 + periodStartMinute;
      const periodEndInMinutes = periodEndHour * 60 + periodEndMinute;
      
      // If there's overlap, add this period to available periods
      if (shiftStartInMinutes < periodEndInMinutes && shiftEndInMinutes > periodStartInMinutes) {
        available.push(period as Period);
      }
    });
    
    return available;
  };

  // Create time slot intervals based on settings and employee shift
  const generateTimeIntervals = async (employee: any, date: Date, period: Period): Promise<TimeSlot[]> => {
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
  const fetchAvailableTimeSlots = async (employee: any, date: Date, period: Period) => {
    if (!employee || !date || !period) return [];
    
    setIsLoadingSlots(true);
    
    try {
      // Format date in YYYY-MM-DD format using the correct timezone handling
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

  const handleEmployeeSelect = (employee: any) => {
    setSelectedEmployee(employee);
    setSelectedDate(null);
    setSelectedPeriod(null);
    setSelectedTime(null);
    setAvailableTimeSlots([]);
    setAvailablePeriods(["Manhã", "Tarde", "Noite"]);
  };

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setSelectedPeriod(null);
    setSelectedTime(null);
    setAvailableTimeSlots([]);
    
    // Check which periods are available for this date and employee
    if (selectedEmployee) {
      const periods = await checkAvailablePeriods(selectedEmployee, date);
      setAvailablePeriods(periods);
    }
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
      // Move to confirmation and trigger the callback with client info and booking settings
      if (selectedEmployee && selectedDate && selectedTime) {
        onBookingConfirm({
          service,
          employee: selectedEmployee,
          date: selectedDate,
          time: selectedTime,
          clientInfo,
          bookingSettings // Passar as configurações de agendamento
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
    setAvailablePeriods(["Manhã", "Tarde", "Noite"]);
    onClose();
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
          <ConfirmationScreen
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onClose={resetDialog}
          />
        ) : currentStep === "clientinfo" ? (
          <ClientInfoForm
            clientInfo={clientInfo}
            onClientInfoChange={handleClientInfoChange}
            onPreviousStep={handlePreviousStep}
            onNextStep={handleNextStep}
          />
        ) : (
          <div className="p-4">
            {/* Service Info */}
            <ServiceInfo service={service} />

            {/* Employee Selection */}
            <EmployeeSelector
              employees={employees}
              selectedEmployee={selectedEmployee}
              onEmployeeSelect={handleEmployeeSelect}
            />

            {/* Calendar */}
            {selectedEmployee && (
              <BookingCalendar
                weekDays={weekDays}
                availableDays={availableDays}
                selectedDate={selectedDate}
                isLoadingDays={isLoadingDays}
                selectedEmployee={selectedEmployee}
                canGoNext={canGoNext}
                canGoPrevious={canGoPrevious}
                currentWeekStart={currentWeekStart}
                onDateSelect={handleDateSelect}
                goToNextWeek={goToNextWeek}
                goToPreviousWeek={goToPreviousWeek}
              />
            )}

            {/* Period Selection */}
            {selectedDate && (
              <PeriodSelector
                selectedPeriod={selectedPeriod}
                onPeriodSelect={handlePeriodSelect}
                availablePeriods={availablePeriods}
              />
            )}

            {/* Time Slots */}
            {selectedDate && selectedPeriod && (
              <TimeSlotSelector
                availableTimeSlots={availableTimeSlots}
                selectedTime={selectedTime}
                isLoadingSlots={isLoadingSlots}
                onTimeSelect={handleTimeSelect}
              />
            )}

            {/* Booking Summary */}
            <BookingSummary
              service={service}
              selectedEmployee={selectedEmployee}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onNextStep={handleNextStep}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
