
import React from "react";
import { Control } from "react-hook-form";
import { BusinessSettingsFormData } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Instagram, MessageSquare, MapPin, Palette } from "lucide-react";
import ColorPicker from "./ColorPicker";

interface OnlineBookingFormProps {
  control: Control<BusinessSettingsFormData>;
}

const OnlineBookingForm: React.FC<OnlineBookingFormProps> = ({
  control,
}) => {
  return (
    <>
      <FormField
        control={control}
        name="instagram"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instagram</FormLabel>
            <FormControl>
              <div className="flex items-center">
                <Instagram className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="@seuinstagram" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="whatsapp"
        render={({ field }) => (
          <FormItem>
            <FormLabel>WhatsApp</FormLabel>
            <FormControl>
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="(11) 99999-9999" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <Textarea placeholder="Endereço completo" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="bookingColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cor da Agenda Online</FormLabel>
            <FormControl>
              <div className="flex items-center">
                <Palette className="mr-2 h-4 w-4 text-muted-foreground" />
                <ColorPicker value={field.value || "#9b87f5"} onChange={field.onChange} />
              </div>
            </FormControl>
            <FormDescription>
              Escolha a cor principal para a sua agenda online
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default OnlineBookingForm;
