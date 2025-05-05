
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SettingsForm from "@/components/settings/SettingsForm";
import { BusinessSettingsFormData } from "@/types/settings";
import { mockSettings } from "@/data/mockSettings";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [settings, setSettings] = useState(mockSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
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
          });
        }
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
        toast.error("Erro ao carregar as configurações");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSubmit = async (data: BusinessSettingsFormData) => {
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
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: updatedData.businessName,
          business_logo: updatedData.businessLogo,
          enable_online_booking: updatedData.enableOnlineBooking,
          slug: updatedData.enableOnlineBooking ? updatedData.slug : null,
          instagram: updatedData.instagram,
          whatsapp: updatedData.whatsapp,
          address: updatedData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

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
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar as configurações");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do seu negócio e da agenda online.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">Carregando configurações...</p>
          </div>
        ) : (
          <SettingsForm
            defaultValues={{
              businessName: settings.businessName,
              businessLogo: settings.businessLogo,
              enableOnlineBooking: settings.enableOnlineBooking,
              slug: settings.slug,
              instagram: settings.instagram,
              whatsapp: settings.whatsapp,
              address: settings.address,
            }}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
