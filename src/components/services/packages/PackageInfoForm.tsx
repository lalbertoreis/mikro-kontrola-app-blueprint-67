import React from "react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import PackagePriceFields from "./PackagePriceFields";

// This matches the schema from ServicePackageForm
const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100),
  showInOnlineBooking: z.boolean().default(true),
});

interface PackageInfoFormProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  editMode: "discount" | "price";
  toggleEditMode: () => void;
  totalPrice: number;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isEditing: boolean;
  onClose?: () => void;
}

const PackageInfoForm = ({ 
  form, 
  editMode, 
  toggleEditMode, 
  totalPrice,
  onSubmit,
  isEditing,
  onClose
}: PackageInfoFormProps) => {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input placeholder="Nome do pacote" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descrição do pacote..."
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <PackagePriceFields 
        form={form} 
        editMode={editMode} 
        toggleEditMode={toggleEditMode} 
        totalPrice={totalPrice} 
      />
      
      <FormField
        control={form.control}
        name="showInOnlineBooking"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Exibir na Agenda Online</FormLabel>
              <FormDescription>
                Tornar este pacote disponível para agendamento online
              </FormDescription>
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
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? "Atualizar" : "Criar"} Pacote
        </Button>
      </div>
    </form>
  );
};

export default PackageInfoForm;
