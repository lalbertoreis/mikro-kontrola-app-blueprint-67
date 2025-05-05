
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SettingsForm from "@/components/settings/SettingsForm";
import { BusinessSettingsFormData } from "@/types/settings";
import { mockSettings } from "@/data/mockSettings";

const Settings = () => {
  const [settings, setSettings] = useState(mockSettings);

  const handleSubmit = (data: BusinessSettingsFormData) => {
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

    setSettings({
      ...settings,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });

    console.log("Configurações salvas:", updatedData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do seu negócio e da agenda online.
        </p>

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
      </div>
    </DashboardLayout>
  );
};

export default Settings;
