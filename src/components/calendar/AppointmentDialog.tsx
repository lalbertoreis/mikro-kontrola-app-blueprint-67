import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { useServicePackages } from "@/hooks/useServicePackages";
import { useEmployees } from "@/hooks/useEmployees";
import { useAvailableTimeSlots, useAppointments, useAppointmentById } from "@/hooks/useAppointments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const appointmentSchema = z.object({
  client: z.string().min(1, { message: "Cliente é obrigatório" }),
  employee: z.string().min(1, { message: "Funcionário é obrigatório" }),
  service: z.string().min(1, { message: "Serviço é obrigatório" }).optional(),
  package: z.string().min(1, { message: "Pacote é obrigatório" }).optional(),
  serviceType: z.enum(["service", "package"]),
  date: z.date({ required_error: "Data é obrigatória" }),
  startTime: z.string().min(1, { message: "Horário de início é obrigatório" }),
  endTime: z.string({ required_error: "Horário de término é obrigatório" }),
  notes: z.string().optional(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedEmployeeId?: string;
  appointmentId?: string;
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedEmployeeId,
  appointmentId,
}) => {
  const { clients } = useClients();
  const { employees } = useEmployees();
  const { services } = useServices();
  const { packages } = useServicePackages();
  const { createAppointment, isCreating } = useAppointments();
  const { data: existingAppointment, isLoading: isLoadingAppointment } = useAppointmentById(appointmentId);
  
  const [isNewClient, setIsNewClient] = useState(false);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [serviceType, setServiceType] = useState<"service" | "package">("service");
  const [manualTimeInput, setManualTimeInput] = useState(true);
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: selectedDate || new Date(),
      employee: selectedEmployeeId || "",
      serviceType: "service",
    },
  });
  
  const selectedEmployee = form.watch("employee");
  const selectedService = form.watch("service");
  const selectedPackage = form.watch("package");
  const selectedType = form.watch("serviceType");
  const selectedDate2 = form.watch("date");

  // Get available time slots based on selected employee, service and date
  const formattedDate = selectedDate2 ? format(selectedDate2, "yyyy-MM-dd") : "";
  const { data: availableSlots = [] } = useAvailableTimeSlots(
    selectedEmployee,
    selectedType === "service" ? selectedService || "" : selectedPackage || "",
    formattedDate
  );
  
  // When employee changes, update available services and packages
  useEffect(() => {
    if (selectedEmployee) {
      const employeeData = employees.find(e => e.id === selectedEmployee);
      if (employeeData) {
        const availableServices = services.filter(service =>
          employeeData.services.includes(service.id)
        );
        setServicesList(availableServices);
        
        // Also update packages (all packages are available to all employees)
        setPackagesList(packages);
      }
    }
  }, [selectedEmployee, employees, services, packages]);

  // Set service type when changing tabs
  useEffect(() => {
    form.setValue("serviceType", serviceType);
    // Clear the other field when switching
    if (serviceType === "service") {
      form.setValue("package", undefined);
    } else {
      form.setValue("service", undefined);
    }
  }, [serviceType, form]);

  // Calculate end time based on selected service duration
  useEffect(() => {
    const startTime = form.watch("startTime");
    const currentServiceType = form.watch("serviceType");
    let serviceDuration = 0;
    
    if (startTime) {
      if (currentServiceType === "service") {
        const serviceId = form.watch("service");
        if (serviceId) {
          const service = services.find(s => s.id === serviceId);
          if (service) {
            serviceDuration = service.duration;
          }
        }
      } else {
        const packageId = form.watch("package");
        if (packageId) {
          const servicePackage = packages.find(p => p.id === packageId);
          if (servicePackage && servicePackage.totalDuration) {
            serviceDuration = servicePackage.totalDuration;
          }
        }
      }
      
      if (serviceDuration > 0) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + serviceDuration;
        
        const endHours = Math.floor(endMinutes / 60).toString().padStart(2, '0');
        const endMins = (endMinutes % 60).toString().padStart(2, '0');
        
        form.setValue("endTime", `${endHours}:${endMins}`);
      }
    }
  }, [form.watch("startTime"), form.watch("service"), form.watch("package"), form.watch("serviceType"), services, packages]);
  
  // Handle form submission
  const onSubmit = async (values: AppointmentFormValues) => {
    try {
      let clientId = values.client;
      
      if (isNewClient && values.clientName) {
        // Create a new client first
        const clientData = await createClient({
          name: values.clientName,
          phone: values.clientPhone || "",
          email: values.clientEmail || "",
        });
        clientId = clientData.id;
      }
      
      // Create the appointment
      await createAppointment({
        employee: values.employee,
        service: values.serviceType === "service" ? values.service! : values.package!,
        client: clientId,
        date: format(values.date, "yyyy-MM-dd"),
        startTime: values.startTime,
        endTime: values.endTime,
        notes: values.notes,
      });
      
      // Close the dialog
      onClose();
      
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };
  
  // This is just a mock function - replace with actual client creation
  const createClient = async (clientData: any) => {
    // In a real implementation, this would call the client service
    return { id: "temp-id" };
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{appointmentId ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          <DialogDescription>
            {appointmentId ? "Atualize os dados do agendamento" : "Preencha os dados para criar um novo agendamento"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Client selection/creation */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Dados do Cliente</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewClient(!isNewClient)}
                >
                  {isNewClient ? "Selecionar cliente existente" : "Novo cliente"}
                </Button>
              </div>
              
              {isNewClient ? (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do cliente</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do cliente" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(00) 00000-0000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="email@exemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
              )}
            </div>
            
            {/* Date picker */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", {
                              locale: ptBR,
                            })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        className={cn("p-3 pointer-events-auto")}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Employee selection */}
            <FormField
              control={form.control}
              name="employee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funcionário</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um funcionário" />
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
            
            {/* Service/Package selection tabs */}
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Tabs 
                    value={serviceType} 
                    onValueChange={(value) => setServiceType(value as "service" | "package")}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="service">Serviço</TabsTrigger>
                      <TabsTrigger value="package">Pacote</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Service selection - only shown if service tab is active */}
            {serviceType === "service" && (
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedEmployee}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            selectedEmployee 
                              ? "Selecione um serviço" 
                              : "Selecione um funcionário primeiro"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {servicesList.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {service.duration} min - R$ {service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {selectedEmployee && servicesList.length === 0 && 
                        "Este funcionário não tem serviços cadastrados"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Package selection - only shown if package tab is active */}
            {serviceType === "package" && (
              <FormField
                control={form.control}
                name="package"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pacote</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedEmployee}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            selectedEmployee 
                              ? "Selecione um pacote" 
                              : "Selecione um funcionário primeiro"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {packagesList.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - {pkg.totalDuration || "N/A"} min - R$ {pkg.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {selectedEmployee && packagesList.length === 0 && 
                        "Não há pacotes cadastrados"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Time selection - allow manual entry */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        disabled={!((serviceType === "service" ? selectedService : selectedPackage) && selectedDate2)}
                      />
                    </FormControl>
                    <FormDescription>
                      Insira um horário no formato HH:MM
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Término</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações sobre o agendamento" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? "Criando..." : appointmentId ? "Atualizar" : "Criar Agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
