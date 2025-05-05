
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useFixedCosts } from "@/hooks/useFixedCosts";
import { FixedCost } from "@/types/fixedCost";
import { fixedCostSchema, FixedCostFormValues } from "./fixedCostSchema";
import { FixedCostFormFields } from "./FixedCostFormFields";
import { FixedCostDialogFooter } from "./FixedCostDialogFooter";

interface FixedCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixedCost?: FixedCost;
}

export const FixedCostDialog: React.FC<FixedCostDialogProps> = ({
  open,
  onOpenChange,
  fixedCost,
}) => {
  const isEditing = Boolean(fixedCost?.id);
  const { addFixedCost, updateFixedCost, isAdding, isUpdating } = useFixedCosts();

  const form = useForm<FixedCostFormValues>({
    resolver: zodResolver(fixedCostSchema),
    defaultValues: {
      name: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: 0,
      description: "",
    },
  });

  React.useEffect(() => {
    if (open && fixedCost) {
      // When editing an existing fixed cost, ensure all required fields are provided
      form.reset({
        name: fixedCost.name,
        month: fixedCost.month,
        year: fixedCost.year,
        amount: fixedCost.amount,
        description: fixedCost.description || "",
      });
    } else if (open) {
      // When creating a new fixed cost, ensure defaults for all required fields
      const currentDate = new Date();
      form.reset({
        name: "",
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        amount: 0,
        description: "",
      });
    }
  }, [open, fixedCost, form]);

  const onSubmit = (data: FixedCostFormValues) => {
    if (isEditing && fixedCost) {
      updateFixedCost({ id: fixedCost.id, data });
    } else {
      addFixedCost(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar" : "Novo"} Custo Fixo</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FixedCostFormFields />
              <FixedCostDialogFooter
                isEditing={isEditing}
                isLoading={isAdding || isUpdating}
                onCancel={() => onOpenChange(false)}
              />
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
