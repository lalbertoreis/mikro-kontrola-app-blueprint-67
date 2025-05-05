
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle, Loader2, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeFormData, Shift } from "@/types/employee";
import { useEmployees, useEmployeeById } from "@/hooks/useEmployees";
import ShiftSelector from "./ShiftSelector";
import ServiceSelector from "./ServiceSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert } from "@/components/ui/alert";

// Alert Dialog for unsaved changes
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Definir esquema de validação para o funcionário
const employeeSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  role: z.string().min(1, { message: "O cargo é obrigatório" }),
});

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: string;
}

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  open,
  onOpenChange,
  employeeId,
}) => {
  const { createEmployee, updateEmployee, isCreating, isUpdating } = useEmployees();
  const { data: employee, isLoading: isEmployeeLoading } = useEmployeeById(employeeId);
  const isEditing = Boolean(employeeId);
  const [activeTab, setActiveTab] = useState("info");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftError, setShiftError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [formDirty, setFormDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      role: "",
    },
  });

  // Mark form as dirty when values change
  useEffect(() => {
    const subscription = form.watch(() => {
      setFormDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Also mark as dirty when shifts or services change
  useEffect(() => {
    if (shifts.length > 0) setFormDirty(true);
  }, [shifts]);

  useEffect(() => {
    if (selectedServices.length > 0) setFormDirty(true);
  }, [selectedServices]);

  // Reset form dirty state when dialog opens/closes
  useEffect(() => {
    if (open) setFormDirty(false);
  }, [open]);

  // Atualizar formulário quando os dados do funcionário forem carregados
  useEffect(() => {
    if (employee && isEditing) {
      form.reset({
        name: employee.name,
        role: employee.role,
      });
      setShifts(employee.shifts);
      setSelectedServices(employee.services);
    } else if (!isEditing) {
      form.reset({
        name: "",
        role: "",
      });
      setShifts([]);
      setSelectedServices([]);
    }
    setShiftError(null);
    setServiceError(null);
  }, [employee, form, isEditing, open]);

  const validateShifts = (): boolean => {
    if (shifts.length === 0) {
      setShiftError("Adicione pelo menos um turno para o funcionário.");
      return false;
    }
    setShiftError(null);
    return true;
  };

  const validateServices = (): boolean => {
    if (selectedServices.length === 0) {
      setServiceError("Selecione pelo menos um serviço que o funcionário realiza.");
      return false;
    }
    setServiceError(null);
    return true;
  };

  const onSubmit = async (data: z.infer<typeof employeeSchema>) => {
    // Validate shifts
    if (!validateShifts()) {
      setActiveTab("shifts");
      return;
    }

    // Validate services
    if (!validateServices()) {
      setActiveTab("services");
      return;
    }

    // Montar dados completos do funcionário
    const employeeData: EmployeeFormData = {
      name: data.name,
      role: data.role,
      shifts,
      services: selectedServices,
    };

    try {
      if (isEditing && employeeId) {
        await updateEmployee({ id: employeeId, data: employeeData });
      } else {
        await createEmployee(employeeData);
      }
      
      setFormDirty(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
    }
  };

  const handleCloseAttempt = () => {
    if (formDirty) {
      setShowUnsavedDialog(true);
      setPendingClose(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    setFormDirty(false);
    if (pendingClose) {
      setPendingClose(false);
      onOpenChange(false);
    }
  };

  const handleContinueEditing = () => {
    setShowUnsavedDialog(false);
    setPendingClose(false);
  };

  const goToNextTab = async () => {
    if (activeTab === "info") {
      const isValid = await form.trigger(["name", "role"]);
      if (isValid) {
        setActiveTab("shifts");
      }
    } else if (activeTab === "shifts") {
      if (validateShifts()) {
        setActiveTab("services");
      }
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "shifts") {
      setActiveTab("info");
    } else if (activeTab === "services") {
      setActiveTab("shifts");
    }
  };

  // Custom shift handler to show inline errors instead of toast
  const handleShiftsChange = (newShifts: Shift[]) => {
    setShiftError(null);
    setShifts(newShifts);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={(state) => {
          // Prevent dialog from closing during form submission
          if (isCreating || isUpdating) return;
          if (!state && formDirty) {
            setShowUnsavedDialog(true);
            setPendingClose(true);
          } else {
            onOpenChange(state);
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogHeader className="sticky top-0 z-40 bg-background pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle>
                {isEditing ? "Editar Funcionário" : "Novo Funcionário"}
              </DialogTitle>
              <DialogClose asChild onClick={(e) => {
                e.preventDefault();
                handleCloseAttempt();
              }}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          {isEmployeeLoading && isEditing ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="max-h-[calc(90vh-10rem)]">
              <div className="px-1"> 
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 sticky top-0 z-10">
                    <TabsTrigger value="info">Informações</TabsTrigger>
                    <TabsTrigger value="shifts">Turnos</TabsTrigger>
                    <TabsTrigger value="services">Serviços</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="pt-4 pb-2">
                    <Form {...form}>
                      <form className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome do funcionário" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cargo</FormLabel>
                              <FormControl>
                                <Input placeholder="Cargo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>

                    <div className="flex justify-end space-x-4 mt-6">
                      <Button variant="outline" onClick={handleCloseAttempt}>
                        Cancelar
                      </Button>
                      <Button onClick={goToNextTab}>
                        Próximo
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="shifts" className="pt-4 pb-2">
                    {shiftError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <span className="ml-2">{shiftError}</span>
                      </Alert>
                    )}
                    <ShiftSelector 
                      shifts={shifts} 
                      onChange={handleShiftsChange} 
                      showInlineErrors={true}
                    />
                    <div className="mt-6 flex justify-end space-x-4">
                      <Button variant="outline" onClick={goToPreviousTab}>
                        Voltar
                      </Button>
                      <Button onClick={goToNextTab}>
                        Próximo
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="services" className="pt-4 pb-2">
                    {serviceError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <span className="ml-2">{serviceError}</span>
                      </Alert>
                    )}
                    <ServiceSelector
                      selectedServiceIds={selectedServices}
                      onChange={(services) => {
                        setServiceError(null);
                        setSelectedServices(services);
                      }}
                    />
                    <DialogFooter className="mt-6">
                      <Button variant="outline" onClick={goToPreviousTab}>
                        Voltar
                      </Button>
                      <Button 
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isCreating || isUpdating}
                      >
                        {(isCreating || isUpdating) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isEditing ? "Atualizar" : "Adicionar"} Funcionário
                      </Button>
                    </DialogFooter>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Ao sair sem salvar, essas alterações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleContinueEditing}>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>Descartar alterações</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmployeeDialog;
