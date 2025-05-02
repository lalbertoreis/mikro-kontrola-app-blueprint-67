
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BusinessSettingsFormData } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, WhatsApp, MapPin, Building, Settings, Image } from "lucide-react";
import { toast } from "sonner";

const settingsFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "O nome do negócio precisa ter pelo menos 2 caracteres.",
  }),
  businessLogo: z.string().optional(),
  enableOnlineBooking: z.boolean().default(false),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
});

interface SettingsFormProps {
  defaultValues?: Partial<BusinessSettingsFormData>;
  onSubmit?: (data: BusinessSettingsFormData) => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({
  defaultValues = {
    businessName: "",
    businessLogo: "",
    enableOnlineBooking: false,
    instagram: "",
    whatsapp: "",
    address: "",
  },
  onSubmit = () => {},
}) => {
  const form = useForm<BusinessSettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  const watchEnableOnlineBooking = form.watch("enableOnlineBooking");

  const handleSubmit = (data: BusinessSettingsFormData) => {
    onSubmit(data);
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>Informações do Negócio</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
              name="businessLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo do Negócio</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Image className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="URL da logo" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    URL de uma imagem para sua logo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
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
          </CardContent>
        </Card>

        {watchEnableOnlineBooking && (
          <Card>
            <CardHeader>
              <CardTitle>Informações para Agenda Online</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <WhatsApp className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit">Salvar Configurações</Button>
        </div>
      </form>
    </Form>
  );
};

export default SettingsForm;
