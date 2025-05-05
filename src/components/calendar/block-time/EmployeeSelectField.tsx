
import React from "react";
import { Control } from "react-hook-form";
import { BlockTimeFormValues } from "./BlockTimeForm";
import { useEmployees } from "@/hooks/useEmployees";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeSelectFieldProps {
  control: Control<BlockTimeFormValues>;
}

export const EmployeeSelectField: React.FC<EmployeeSelectFieldProps> = ({ control }) => {
  const { employees } = useEmployees();
  
  return (
    <FormField
      control={control}
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
  );
};
