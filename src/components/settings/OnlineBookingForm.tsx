
import React from "react";
import { Control, useWatch } from "react-hook-form";
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
import { Instagram, MessageSquare, MapPin, Palette, Link, Copy } from "lucide-react";
import ColorPicker from "./ColorPicker";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OnlineBookingFormProps {
  control: Control<BusinessSettingsFormData>;
}

const OnlineBookingForm: React.FC<OnlineBookingFormProps> = ({
  control,
}) => {
  const slug = useWatch({ control, name: "slug" });
  const enableOnlineBooking = useWatch({ control, name: "enableOnlineBooking" });

  const bookingUrl = slug ? `${window.location.origin}/booking/${slug}` : "";

  const copyToClipboard = () => {
    if (bookingUrl) {
      navigator.clipboard.writeText(bookingUrl);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  return (
    <>
      {enableOnlineBooking && slug && (
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FormLabel>Link da Agenda Online</FormLabel>
          <div className="flex items-center gap-2 mt-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <Input 
              value={bookingUrl} 
              readOnly 
              className="flex-1 bg-white dark:bg-slate-700" 
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <FormDescription className="mt-1">
            Este é o link que seus clientes usarão para fazer agendamentos online
          </FormDescription>
        </div>
      )}

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
