
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { DatePickerField } from "./DatePickerField";
import { EmployeeSelectField } from "./EmployeeSelectField";
import { toast } from "sonner";
import { format } from "date-fns";

const blockTimeSchema = z.object({
  employee: z.string().min(1, { message: "Funcionário é obrigatório" }),
  date: z.date({ required_error: "Data é obrigatória" }),
  startTime: z.string().min(1, { message: "Hora de início é obrigatória" }),
  endTime: z.string().min(1, { message: "Hora de término é obrigatória" }),
  reason: z.string().min(1, { message: "Motivo é obrigatório" }),
});

export type BlockTimeFormValues = z.infer<typeof blockTimeSchema>;

export interface BlockTimeFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  selectedDate: Date;
  selectedEmployeeId?: string;
}

export const BlockTimeForm: React.FC<BlockTimeFormProps> = ({
  onCancel,
  onSuccess,
  selectedDate,
  selectedEmployeeId,
}) => {
  const { blockTimeSlot, isBlocking } = useAppointments();
  
  const defaultValues = {
    date: selectedDate,
    employee: selectedEmployeeId || "",
    startTime: "",
    endTime: "",
    reason: "",
  };

  const form = useForm<BlockTimeFormValues>({
    resolver: zodResolver(blockTimeSchema),
    defaultValues,
  });

  const handleSubmit = async (values: BlockTimeFormValues) => {
    try {
      // Format the date as a string (YYYY-MM-DD) before passing to blockTimeSlot
      const formattedDate = format(values.date, "yyyy-MM-dd");
      
      await blockTimeSlot({
        employeeId: values.employee,
        date: formattedDate, // Send the formatted date string
        startTime: values.startTime,
        endTime: values.endTime,
        reason: values.reason,
      });
      toast.success("Horário bloqueado com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao bloquear horário:", error);
      toast.error("Erro ao bloquear horário. Tente novamente.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
