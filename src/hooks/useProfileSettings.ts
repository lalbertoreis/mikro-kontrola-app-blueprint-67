
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BusinessSettings, BusinessSettingsFormData } from "@/types/settings";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { mockSettings } from "@/data/mockSettings";

export function useProfileSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(mockSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao buscar configurações:", error);
        toast.error("Erro ao carregar as configurações");
        setIsLoading(false);
        return;
      }
      
      if (data) {
        setSettings({
          ...settings,
          businessName: data.business_name || '',
          businessLogo: data.business_logo || '',
          enableOnlineBooking: data.enable_online_booking || false,
          slug: data.slug || '',
          instagram: data.instagram || '',
          whatsapp: data.whatsapp || '',
          address: data.address || '',
          bookingSimultaneousLimit: data.booking_simultaneous_limit || 3,
          bookingFutureLimit: data.booking_future_limit || 3,
          bookingTimeInterval: data.booking_time_interval || 30,
          bookingCancelMinHours: data.booking_cancel_min_hours || 1,
          bookingColor: data.booking_color || '#9b87f5',
        });
      } else {
        // If no profile exists yet, create one
        if (user.id) {
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              business_name: '',
              business_logo: '',
              enable_online_booking: false,
              slug: '',
              instagram: '',
              whatsapp: '',
              address: '',
              booking_simultaneous_limit: 3,
              booking_future_limit: 3, 
              booking_time_interval: 30,
              booking_cancel_min_hours: 1,
              booking_color: '#9b87f5'
            });
          
          if (createError) {
            console.error("Erro ao criar perfil:", createError);
            toast.error("Erro ao criar perfil");
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      toast.error("Erro ao carregar as configurações");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (data: BusinessSettingsFormData, onSuccessCallback?: () => void) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    // Generate slug from business name if not provided and online booking is enabled
    let updatedData = { ...data };
    
    if (data.enableOnlineBooking && (!data.slug || data.slug.trim() === "")) {
      updatedData.slug = data.businessName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    try {
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Erro ao verificar perfil:", checkError);
        toast.error("Erro ao salvar as configurações");
        return;
      }
      
      const profileData = {
        business_name: updatedData.businessName,
        business_logo: updatedData.businessLogo,
        enable_online_booking: updatedData.enableOnlineBooking,
        slug: updatedData.enableOnlineBooking ? updatedData.slug : null,
        instagram: updatedData.instagram,
        whatsapp: updatedData.whatsapp,
        address: updatedData.address,
        booking_simultaneous_limit: updatedData.bookingSimultaneousLimit,
        booking_future_limit: updatedData.bookingFutureLimit,
        booking_time_interval: updatedData.bookingTimeInterval,
        booking_cancel_min_hours: updatedData.bookingCancelMinHours,
        booking_color: updatedData.bookingColor || '#9b87f5',
        updated_at: new Date().toISOString()
      };
      
      let error;
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id);
        
        error = updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            ...profileData
          });
        
        error = insertError;
      }

      if (error) throw error;
      
      // Update local state
      const updatedSettings = {
        ...settings,
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };

      setSettings(updatedSettings);
      await refreshProfile();
      toast.success("Configurações salvas com sucesso!");
      
      // Execute callback if provided
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar as configurações");
    }
  };

  return {
    settings,
    isLoading,
    saveSettings
  };
}
