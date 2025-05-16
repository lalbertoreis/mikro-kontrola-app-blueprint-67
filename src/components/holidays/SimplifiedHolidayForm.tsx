import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useHolidays } from "@/hooks/useHolidays";
import { Holiday } from "@/types/holiday";

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
import { Calendar } from "@/components/ui/calendar";
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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { DialogFooter } from "@/components/ui/dialog";

// Define form schema using zod
const holidayFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  date: z.date({ required_error: "Data é obrigatória" }),
  type: z.enum(["national", "state", "municipal", "custom"], {
    required_error: "Selecione o tipo de feriado",
  }),
  isActive: z.boolean().default(true),
  blockingType: z.enum(["full_day", "morning", "afternoon", "custom"], { 
    required_error: "Tipo de bloqueio é obrigatório" 
  }).default("full_day"),
  customStartTime: z.string().optional(),
  customEndTime: z.string().optional(),
});

export type HolidayFormValues = z.infer<typeof holidayFormSchema>;

interface SimplifiedHolidayFormProps {
  defaultValues?: Holiday | null;
  onCancel: () => void;
  onFormChange?: () => void;
  onSuccess?: () => void; // Add the onSuccess prop
}

export const SimplifiedHolidayForm: React.FC<SimplifiedHolidayFormProps> = ({
  defaultValues,
  onCancel,
  onFormChange,
  onSuccess,
}) => {
  const { createHoliday, updateHoliday, isCreating, isUpdating } = useHolidays();
  const isEditing = Boolean(defaultValues?.id);

  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      type: defaultValues?.type || "custom",
      isActive: defaultValues?.isActive !== undefined ? defaultValues.isActive : true,
      blockingType: defaultValues?.blockingType || "full_day",
      customStartTime: defaultValues?.customStartTime || "",
      customEndTime: defaultValues?.customEndTime || "",
    },
  });

  // Listen for form changes and call onFormChange when they happen
  React.useEffect(() => {
    const subscription = form.watch(() => {
      if (onFormChange) {
        onFormChange();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  const showBlockingConfig = form.watch("isActive");
  const blockingType = form.watch("blockingType");

  const handleSubmit = async (data: HolidayFormValues) => {
    try {
      if (isEditing && defaultValues?.id) {
        await updateHoliday({ 
          id: defaultValues.id, 
          data: {
            ...data,
            date: data.date, // This is automatically converted to the correct format in the service
          }
        });
      } else {
        await createHoliday(data);
      }
      
      // Call onSuccess after successful form submission
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting holiday form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do feriado</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Natal, Ano Novo..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do feriado</FormLabel>
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
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione a data</span>
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de feriado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="national">Nacional</SelectItem>
                  <SelectItem value="state">Estadual</SelectItem>
                  <SelectItem value="municipal">Municipal</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Bloquear agendamentos</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {showBlockingConfig && (
          <div className="space-y-3 border p-3 rounded-md">
            <h4 className="font-medium">Configuração de Bloqueio</h4>
            
            <FormField
              control={form.control}
              name="blockingType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Período de Bloqueio</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full_day" id="full_day" />
                        <FormLabel htmlFor="full_day" className="font-normal cursor-pointer">
                          Dia inteiro
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="morning" id="morning" />
                        <FormLabel htmlFor="morning" className="font-normal cursor-pointer">
                          Manhã (até 12:00)
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="afternoon" id="afternoon" />
                        <FormLabel htmlFor="afternoon" className="font-normal cursor-pointer">
                          Tarde (após 12:00)
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <FormLabel htmlFor="custom" className="font-normal cursor-pointer">
                          Personalizado
                        </FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {blockingType === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário Inicial</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customEndTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário Final</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
            className="bg-kontrola-600 hover:bg-kontrola-700"
          >
            {isEditing ? "Atualizar" : "Criar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
