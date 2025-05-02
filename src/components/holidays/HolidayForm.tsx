
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Holiday, HolidayFormData, HolidayType } from "@/types/holiday";
import { useHolidayById } from "@/hooks/useHolidays";

const formSchema = z.object({
  date: z.date({
    required_error: "A data do feriado é obrigatória",
  }),
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  type: z.enum(["national", "state", "municipal", "custom"], {
    required_error: "Selecione o tipo de feriado",
  }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface HolidayFormProps {
  defaultValues?: Holiday | null;
  onCancel: () => void;
}

const HolidayForm: React.FC<HolidayFormProps> = ({ defaultValues, onCancel }) => {
  const navigate = useNavigate();
  const isEditing = Boolean(defaultValues?.id);

  const form = useForm<HolidayFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
      ? {
          date: defaultValues.date ? new Date(defaultValues.date) : new Date(),
          name: defaultValues.name,
          type: defaultValues.type,
          description: defaultValues.description,
          isActive: defaultValues.isActive,
        }
      : {
          date: new Date(),
          name: "",
          type: "custom" as HolidayType,
          description: "",
          isActive: true,
        },
  });

  const onSubmit = async (data: HolidayFormData) => {
    try {
      if (isEditing && defaultValues?.id) {
        // Função de atualização será implementada depois
        toast.success("Feriado atualizado com sucesso!");
      } else {
        // Função de criação será implementada depois
        toast.success("Feriado adicionado com sucesso!");
      }
      navigate("/dashboard/holidays");
    } catch (error) {
      console.error("Erro ao salvar feriado:", error);
      toast.error(
        isEditing
          ? "Erro ao atualizar feriado. Tente novamente."
          : "Erro ao adicionar feriado. Tente novamente."
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo de Data */}
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
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
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
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de Nome */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do feriado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo de Tipo */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="national">Nacional</SelectItem>
                    <SelectItem value="state">Estadual</SelectItem>
                    <SelectItem value="municipal">Municipal</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Selecione o tipo de feriado para categorização.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de Ativo */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Ativo</FormLabel>
                  <FormDescription>
                    Determina se o feriado está ativo no sistema.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campo de Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição opcional do feriado"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Forneça informações adicionais sobre o feriado (opcional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? "Atualizar" : "Adicionar"} Feriado
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HolidayForm;
