
import React, { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface AppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedEmployeeId?: string;
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

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "10:00";

export default function AppointmentDialog({
  isOpen,
  onClose,
  selectedDate,
  selectedEmployeeId,
  appointmentId,
}: AppointmentDialogProps) {
  const { services } = useServices();
  const { employees } = useEmployees();
  const { clients } = useClients();
  const { createAppointment, isCreating } = useAppointments();
  const { data: appointment, isLoading: isLoadingAppointment } = useAppointmentById(appointmentId);
  const [serviceDuration, setServiceDuration] = useState(60);

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      employee: selectedEmployeeId || "",
      service: "",
      client: "",
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
      notes: "",
    },
  });

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

      // Find the service to get its duration
      if (appointment.serviceId) {
        const service = services.find((s) => s.id === appointment.serviceId);
        if (service) {
          setServiceDuration(service.duration);
        }
      }
    } else if (!appointmentId) {
      // Reset form for new appointments
      form.reset({
        employee: selectedEmployeeId || "",
        service: "",
        client: "",
        date: format(selectedDate, "yyyy-MM-dd"),
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
        notes: "",
      });
    }
  }, [appointment, isLoadingAppointment, appointmentId, form, selectedDate, selectedEmployeeId, services]);

  // Update end time based on service duration
  const handleServiceChange = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      const { startTime } = form.getValues();
      const startDate = parse(startTime, "HH:mm", new Date());
      const endDate = new Date(startDate.getTime() + service.duration * 60000);
      const endTime = format(endDate, "HH:mm");
      
      setServiceDuration(service.duration);
      form.setValue("endTime", endTime);
    }
  };

  const onSubmit = (data: z.infer<typeof appointmentSchema>) => {
    createAppointment({
      ...data,
      id: appointmentId, // Pass the ID when editing
    });
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointmentId ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Serviço</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleServiceChange(value);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {service.duration} min - R${" "}
                            {service.price?.toFixed(2)}
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
                    <FormLabel>Cliente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Horário de Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
                    <FormLabel>Horário de Término</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {appointmentId 
                  ? isCreating ? "Salvando..." : "Salvar" 
                  : isCreating ? "Agendando..." : "Agendar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
