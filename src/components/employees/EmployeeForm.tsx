
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EmployeeFormData } from "@/types/employee";

// Exemplo de funcionário para edição
const mockEmployee = {
  id: "1",
  name: "Ana Silva",
  email: "ana.silva@exemplo.com",
  phone: "(11) 98765-4321",
  role: "Atendente",
  startDate: "2023-01-15",
  salary: 2500,
  notes: "Funcionária dedicada e pontual.",
  createdAt: "2023-01-10T14:30:00Z",
  updatedAt: "2023-01-10T14:30:00Z"
};

const employeeSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(1, { message: "O telefone é obrigatório" }),
  role: z.string().min(1, { message: "O cargo é obrigatório" }),
  startDate: z.string().min(1, { message: "A data de início é obrigatória" }),
  salary: z.number().optional(),
  notes: z.string().optional(),
});

interface EmployeeFormProps {
  employeeId?: string;
  onSuccess: () => void;
}

const EmployeeForm = ({ employeeId, onSuccess }: EmployeeFormProps) => {
  const isEditing = Boolean(employeeId);

  // Na implementação real, aqui buscaríamos dados do funcionário se estiver editando
  // const { data: employee, isLoading } = useQuery(...);
  
  const defaultValues: EmployeeFormData = isEditing
    ? {
        name: mockEmployee.name,
        email: mockEmployee.email,
        phone: mockEmployee.phone,
        role: mockEmployee.role,
        startDate: mockEmployee.startDate,
        salary: mockEmployee.salary,
        notes: mockEmployee.notes,
      }
    : {
        name: "",
        email: "",
        phone: "",
        role: "",
        startDate: new Date().toISOString().split('T')[0],
        salary: undefined,
        notes: "",
      };

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  const onSubmit = (data: EmployeeFormData) => {
    console.log("Form submitted:", data);
    
    // Na implementação real, aqui enviaríamos os dados para API
    // isEditing ? updateEmployee(employeeId, data) : createEmployee(data);
    
    // Simulando o sucesso após envio
    setTimeout(() => {
      onSuccess();
    }, 1000);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefone" {...field} />
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

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salário</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Salário" 
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : undefined);
                        }}
                        value={field.value ?? ''}
                      />
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
                    <Textarea
                      placeholder="Observações sobre o funcionário"
                      rows={4}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => onSuccess()}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Atualizar" : "Adicionar"} Funcionário
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EmployeeForm;
