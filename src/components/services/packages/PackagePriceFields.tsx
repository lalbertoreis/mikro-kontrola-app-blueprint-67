
import React from "react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CircleHelp } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

// This matches the schema from ServicePackageForm
const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100),
  showInOnlineBooking: z.boolean().default(true),
});

interface PackagePriceFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  editMode: "discount" | "price";
  toggleEditMode: () => void;
  totalPrice: number;
}

const PackagePriceFields = ({
  form,
  editMode,
  toggleEditMode,
  totalPrice,
}: PackagePriceFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {editMode === "discount" ? (
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <span>Desconto (%)</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 p-1" 
                  onClick={toggleEditMode}
                >
                  <Tooltip>
                    <TooltipTrigger>
                      <CircleHelp className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clique para editar o preço final em vez do desconto</p>
                    </TooltipContent>
                  </Tooltip>
                </Button>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <span>Preço Final (R$)</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 p-1" 
                  onClick={toggleEditMode}
                >
                  <Tooltip>
                    <TooltipTrigger>
                      <CircleHelp className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clique para editar o desconto em vez do preço final</p>
                    </TooltipContent>
                  </Tooltip>
                </Button>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalPrice}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {editMode === "discount" ? (
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço Final Calculado (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  disabled
                  {...field}
                  value={field.value.toFixed(2)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desconto Calculado (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled
                  {...field}
                  value={field.value.toFixed(2)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default PackagePriceFields;
