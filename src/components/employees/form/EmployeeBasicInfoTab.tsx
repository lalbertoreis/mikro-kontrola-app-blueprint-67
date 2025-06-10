
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import * as z from "zod";

const employeeSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  role: z.string().min(1, { message: "O cargo é obrigatório" }),
});

interface EmployeeBasicInfoTabProps {
  form: UseFormReturn<z.infer<typeof employeeSchema>>;
  onNext: () => void;
  onCancel: () => void;
}

const EmployeeBasicInfoTab: React.FC<EmployeeBasicInfoTabProps> = ({
  form,
  onNext,
  onCancel,
}) => {
  return (
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

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
          <Button variant="outline" type="button" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="button" onClick={onNext} className="w-full sm:w-auto">
            Próximo
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmployeeBasicInfoTab;
