
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X, Check } from "lucide-react";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";

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

  // Generate week days (7 days from today)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Sample time slots
  const timeSlots: Record<Period, TimeSlot[]> = {
    "Manhã": ["08:00", "09:00", "10:00", "11:00"],
    "Tarde": ["13:00", "14:00", "15:00", "16:00", "17:00"],
    "Noite": ["18:00", "19:00", "20:00"]
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
    onClose();
  };

  const formatDayOfWeek = (date: Date) => {
    return format(date, "EEEE", { locale: ptBR }).toUpperCase();
  };

  const formatDayOfMonth = (date: Date) => {
    return format(date, "dd");
  };

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
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
            {/* Employee Selection */}
            <div className="mb-6">
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
              <p className="text-center text-gray-500 mb-2">
                {format(new Date(), "MMMM yyyy", { locale: ptBR })}
              </p>
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
                <div className="flex justify-center space-x-2">
                  {(["Manhã", "Tarde", "Noite"] as Period[]).map((period) => (
                    <Button
                      key={period}
                      variant={selectedPeriod === period ? "default" : "outline"}
                      className={selectedPeriod === period ? "bg-purple-500 hover:bg-purple-600" : ""}
                      onClick={() => handlePeriodSelect(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Time Slots */}
            {selectedDate && selectedPeriod && (
              <div className="mb-6">
                <div className="flex overflow-x-auto space-x-2 pb-2">
                  {timeSlots[selectedPeriod].map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      className={`whitespace-nowrap ${
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
