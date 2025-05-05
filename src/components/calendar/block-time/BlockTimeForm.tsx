
import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEmployees } from "@/hooks/useEmployees";
import { useAppointments } from "@/hooks/useAppointments";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { DialogFooter } from "@/components/ui/dialog";
import { DatePickerField } from "./DatePickerField";
import { EmployeeSelectField } from "./EmployeeSelectField";

const blockTimeSchema = z.object({
  employee: z.string().min(1, { message: "Funcionário é obrigatório" }),
  date: z.date({ required_error: "Data é obrigatória" }),
  startTime: z.string().min(1, { message: "Hora de início é obrigatória" }),
  endTime: z.string().min(1, { message: "Hora de término é obrigatória" }),
  reason: z.string().min(1, { message: "Motivo é obrigatório" }),
});

export type BlockTimeFormValues = z.infer<typeof blockTimeSchema>;

interface BlockTimeFormProps {
  onSubmit: (values: BlockTimeFormValues) => Promise<void>;
  onCancel: () => void;
  isBlocking: boolean;
  defaultValues: {
    date: Date;
    employee: string;
    startTime: string;
    endTime: string;
    reason: string;
  };
}

export const BlockTimeForm: React.FC<BlockTimeFormProps> = ({
  onSubmit,
  onCancel,
  isBlocking,
  defaultValues,
}) => {
  const form = useForm<BlockTimeFormValues>({
    resolver: zodResolver(blockTimeSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Date and Employee fields */}
        <DatePickerField control={form.control} />
        <EmployeeSelectField control={form.control} />
        
        {/* Time selection */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de início</FormLabel>
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
                <FormLabel>Hora de término</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Reason */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Motivo do bloqueio" 
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
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isBlocking}
            variant="destructive"
          >
            {isBlocking ? "Bloqueando..." : "Bloquear Horário"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
