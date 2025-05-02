
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SettingsForm from "@/components/settings/SettingsForm";
import { BusinessSettingsFormData } from "@/types/settings";
import { mockSettings } from "@/data/mockSettings";

const Settings = () => {
  const [settings, setSettings] = useState(mockSettings);

  const handleSubmit = (data: BusinessSettingsFormData) => {
    setSettings({
      ...settings,
      ...data,
      updatedAt: new Date().toISOString(),
    });

    console.log("Configurações salvas:", data);
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
