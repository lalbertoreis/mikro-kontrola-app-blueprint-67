
import React, { useState } from "react";
import { Control, useWatch, useFormContext } from "react-hook-form";
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
import { Instagram, MessageSquare, MapPin, Palette, Link, Copy, Check } from "lucide-react";
import ColorPicker from "./ColorPicker";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnlineBookingFormProps {
  control: Control<BusinessSettingsFormData>;
}

const OnlineBookingForm: React.FC<OnlineBookingFormProps> = ({
  control,
}) => {
  const { user } = useAuth();
  const { setValue, getValues } = useFormContext();
  const slug = useWatch({ control, name: "slug" });
  const enableOnlineBooking = useWatch({ control, name: "enableOnlineBooking" });
  const [slugValue, setSlugValue] = useState(slug || "");
  const [isValidatingSlug, setIsValidatingSlug] = useState(false);
  
  // Sincronizar slug inicial
  React.useEffect(() => {
    if (slug && slugValue !== slug) {
      setSlugValue(slug);
    }
  }, [slug]);

  const bookingUrl = slug ? `${window.location.origin}/booking/${slug}` : "";

  const copyToClipboard = () => {
    if (bookingUrl) {
      navigator.clipboard.writeText(bookingUrl);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const validateAndSaveSlug = async () => {
    if (!slugValue.trim()) {
      toast.error("Por favor, digite um identificador para sua agenda");
      return;
    }

    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsValidatingSlug(true);

    try {
      // Validar formato do slug
      const cleanSlug = slugValue
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      if (cleanSlug !== slugValue) {
        setSlugValue(cleanSlug);
      }

      // Verificar se o slug já existe
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', cleanSlug)
        .neq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao validar slug:", error);
        toast.error("Erro ao validar identificador");
        return;
      }

      if (existingProfile) {
        toast.error("Este identificador já está em uso. Escolha outro nome para sua agenda online.");
        return;
      }

      // Salvar no formulário
      setValue("slug", cleanSlug);
      toast.success("Identificador validado e salvo com sucesso!");
      
    } catch (error) {
      console.error("Erro ao validar slug:", error);
      toast.error("Erro ao validar identificador");
    } finally {
      setIsValidatingSlug(false);
    }
  };

  return (
    <>
      {/* Campo SLUG */}
      <div className="space-y-2">
        <FormLabel>
          Identificador da Agenda {enableOnlineBooking && <span className="text-destructive">*</span>}
        </FormLabel>
        <div className="text-sm text-muted-foreground mb-2">
          Seu link será: {window.location.origin}/booking/<strong>[seu-identificador]</strong>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            value={slugValue}
            onChange={(e) => setSlugValue(e.target.value)}
            placeholder="seu-negocio"
            disabled={isValidatingSlug}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={validateAndSaveSlug}
            disabled={isValidatingSlug || !slugValue.trim()}
            className="shrink-0"
          >
            {isValidatingSlug ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        </div>
        <FormDescription>
          Digite o identificador único para sua agenda online e clique no botão ✓ para validar
        </FormDescription>
        {enableOnlineBooking && !slug && (
          <p className="text-sm text-destructive">
            O identificador é obrigatório quando a agenda online está habilitada
          </p>
        )}
      </div>

      {/* Campo LINK Completo (somente leitura) */}
      {slug && (
        <div className="space-y-2">
          <FormLabel>Link Completo da Agenda</FormLabel>
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <Input 
              value={bookingUrl} 
              readOnly 
              className="flex-1 bg-muted cursor-not-allowed" 
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
          <FormDescription>
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
