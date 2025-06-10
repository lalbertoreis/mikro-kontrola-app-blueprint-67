
import React, { useEffect, useState } from "react";
import { format, parse, addMinutes, isSameDay } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useServices } from "@/hooks/useServices";
import { useEmployees } from "@/hooks/useEmployees";
import { useClients } from "@/hooks/useClients";
import { useAppointments, useAppointmentById } from "@/hooks/useAppointments";
import { toast } from "sonner";

interface AppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedEmployeeId?: string;
  selectedHour?: number;
  appointmentId?: string;
}

const appointmentSchema = z.object({
  employee: z.string({
    required_error: "É necessário selecionar um profissional",
  }),
  service: z.string({
    required_error: "É necessário selecionar um serviço",
  }),
  client: z.string({
    required_error: "É necessário selecionar um cliente",
  }),
  date: z.string({
    required_error: "É necessário selecionar uma data",
  }),
  startTime: z.string({
    required_error: "É necessário selecionar um horário de início",
  }),
  endTime: z.string({
    required_error: "É necessário selecionar um horário de término",
  }),
  notes: z.string().optional(),
});

export default function AppointmentDialog({
  isOpen,
  onClose,
  selectedDate,
  selectedEmployeeId,
  selectedHour,
  appointmentId,
}: AppointmentDialogProps) {
  const { services } = useServices();
  const { employees } = useEmployees();
  const { clients } = useClients();
  const { createAppointment, isCreating, appointments } = useAppointments();
  const { data: appointment, isLoading: isLoadingAppointment } = useAppointmentById(appointmentId);
  const [serviceDuration, setServiceDuration] = useState(60);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [availableServices, setAvailableServices] = useState(services);

  // Calculate default start time based on selected hour or current time
  const getDefaultStartTime = (): string => {
    if (selectedHour !== undefined) {
      return `${selectedHour.toString().padStart(2, '0')}:00`;
    }
    
    const now = new Date();
    const isToday = isSameDay(selectedDate, now);
    
    if (isToday) {
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      
      if (currentMinutes < 30) {
        return `${currentHour}:30`;
      } else {
        const nextHour = currentHour + 1;
        return `${nextHour.toString().padStart(2, '0')}:00`;
      }
    }
    
    return "09:00";
  };

  const getDefaultEndTime = (startTime: string, duration: number = 60): string => {
    const startDate = parse(startTime, "HH:mm", new Date());
    const endDate = addMinutes(startDate, duration);
    return format(endDate, "HH:mm");
  };

  const defaultStartTime = getDefaultStartTime();
  const defaultEndTime = getDefaultEndTime(defaultStartTime);

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      employee: selectedEmployeeId || "",
      service: "",
      client: "",
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      notes: "",
    },
  });

  // Filter services based on selected employee
  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(emp => emp.id === selectedEmployee);
      if (employee && employee.services) {
        const filteredServices = services.filter(service => 
          employee.services.includes(service.id)
        );
        setAvailableServices(filteredServices);
      }
    } else {
      setAvailableServices(services);
    }
  }, [selectedEmployee, employees, services]);

  // Load appointment data when editing
  useEffect(() => {
    if (appointment && !isLoadingAppointment) {
      const startTime = format(appointment.start, "HH:mm");
      const endTime = format(appointment.end, "HH:mm");

      form.reset({
        employee: appointment.employeeId,
        service: appointment.serviceId || "",
        client: appointment.clientId || "",
        date: format(appointment.start, "yyyy-MM-dd"),
        startTime,
        endTime,
        notes: appointment.notes || "",
      });

      setSelectedEmployee(appointment.employeeId);

      if (appointment.serviceId) {
        const service = services.find((s) => s.id === appointment.serviceId);
        if (service) {
          setServiceDuration(service.duration);
        }
      }
    } else if (!appointmentId) {
      const newDefaultStartTime = getDefaultStartTime();
      const newDefaultEndTime = getDefaultEndTime(newDefaultStartTime);
      
      form.reset({
        employee: selectedEmployeeId || "",
        service: "",
        client: "",
        date: format(selectedDate, "yyyy-MM-dd"),
        startTime: newDefaultStartTime,
        endTime: newDefaultEndTime,
        notes: "",
      });
      
      setSelectedEmployee(selectedEmployeeId || "");
    }
  }, [appointment, isLoadingAppointment, appointmentId, form, selectedDate, selectedEmployeeId, services, selectedHour]);

  // Handle employee change
  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    form.setValue("employee", employeeId);
    form.setValue("service", ""); // Reset service when employee changes
  };

  // Update end time based on service duration
  const handleServiceChange = (serviceId: string) => {
    const service = availableServices.find((s) => s.id === serviceId);
    if (service) {
      const { startTime } = form.getValues();
      const endTime = getDefaultEndTime(startTime, service.duration);
      
      setServiceDuration(service.duration);
      form.setValue("endTime", endTime);
    }
  };

  // Update end time when start time changes
  const handleStartTimeChange = (startTime: string) => {
    const endTime = getDefaultEndTime(startTime, serviceDuration);
    form.setValue("endTime", endTime);
  };

  // Check for conflicts before creating appointment
  const checkForConflicts = (formData: z.infer<typeof appointmentSchema>) => {
    const appointmentDate = new Date(formData.date + 'T00:00:00');
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(appointmentDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    // Check for employee conflicts
    const employeeConflicts = appointments.filter(apt => {
      if (appointmentId && apt.id === appointmentId) return false; // Skip current appointment when editing
      if (apt.employeeId !== formData.employee) return false;
      if (apt.status === 'canceled') return false;

      const aptStart = new Date(apt.start);
      const aptEnd = new Date(apt.end);

      return (startDateTime < aptEnd && endDateTime > aptStart);
    });

    if (employeeConflicts.length > 0) {
      return "Este profissional já possui um agendamento neste horário.";
    }

    // Check for client conflicts
    const clientConflicts = appointments.filter(apt => {
      if (appointmentId && apt.id === appointmentId) return false; // Skip current appointment when editing
      if (apt.clientId !== formData.client) return false;
      if (apt.status === 'canceled') return false;

      const aptStart = new Date(apt.start);
      const aptEnd = new Date(apt.end);

      return (startDateTime < aptEnd && endDateTime > aptStart);
    });

    if (clientConflicts.length > 0) {
      return "Este cliente já possui um agendamento neste horário.";
    }

    return null;
  };

  const onSubmit = async (data: z.infer<typeof appointmentSchema>) => {
    try {
      // Check for conflicts before creating
      const conflictMessage = checkForConflicts(data);
      if (conflictMessage) {
        toast.error(conflictMessage);
        return;
      }

      const appointmentData = {
        employee: data.employee,
        service: data.service,
        client: data.client,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        ...(appointmentId ? { id: appointmentId } : {})
      };
      
      await createAppointment(appointmentData);
      
      // Reset form and close dialog
      form.reset({
        employee: "",
        service: "",
        client: "",
        date: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "10:00",
        notes: "",
      });
      setSelectedEmployee("");
      onClose();
      
      toast.success(appointmentId ? "Agendamento atualizado com sucesso!" : "Agendamento criado com sucesso!");
    } catch (error) {
      console.error("Error submitting appointment:", error);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    form.reset({
      employee: "",
      service: "",
      client: "",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "10:00",
      notes: "",
    });
    setSelectedEmployee("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-full max-w-lg mx-auto p-4 sm:p-6 bg-white dark:bg-slate-900 overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold">
            {appointmentId ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {appointmentId ? "Edite as informações do agendamento." : "Preencha as informações para criar um novo agendamento."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="employee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional *</FormLabel>
                    <Select
                      onValueChange={handleEmployeeChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleServiceChange(value);
                      }}
                      value={field.value}
                      disabled={!selectedEmployee}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={selectedEmployee ? "Selecione um serviço" : "Primeiro selecione um profissional"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableServices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {service.duration} min - R$ {service.price?.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Início *</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          handleStartTimeChange(e.target.value);
                        }}
                        className="w-full" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Término *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="w-full resize-none" placeholder="Observações opcionais..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={handleClose} size="sm">
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating} size="sm">
                {appointmentId 
                  ? isCreating ? "Salvando..." : "Salvar Alterações" 
                  : isCreating ? "Agendando..." : "Criar Agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
