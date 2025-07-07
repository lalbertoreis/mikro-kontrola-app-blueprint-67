
import React from "react";
import { Control } from "react-hook-form";
import { BusinessSettingsFormData } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Building, Globe } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface BusinessInfoFormProps {
  control: Control<BusinessSettingsFormData>;
  watchEnableOnlineBooking: boolean;
  watchBusinessLogo?: string;
}

const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({
  control,
  watchEnableOnlineBooking,
  watchBusinessLogo,
}) => {
  return (
    <>
      <FormField
        control={control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Negócio</FormLabel>
            <FormControl>
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Nome do seu negócio" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="businessLogo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logo do Negócio</FormLabel>
            <FormControl>
              <div className="flex justify-center">
                <ImageUpload 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              </div>
            </FormControl>
            <FormDescription className="text-center">
              Faça upload de uma imagem para sua logo
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="enableOnlineBooking"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Agenda Online</FormLabel>
              <FormDescription>
                Permitir agendamentos online para seus clientes
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

    </>
  );
};

export default BusinessInfoForm;
