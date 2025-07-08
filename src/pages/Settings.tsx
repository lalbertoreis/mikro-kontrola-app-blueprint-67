
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SettingsHeader from "@/components/settings/SettingsHeader";
import SettingsContent from "@/components/settings/SettingsContent";
import { useProfileSettings } from "@/hooks/useProfileSettings";

const Settings = () => {
  const { settings, isLoading, saveSettings } = useProfileSettings();

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-full">
        <SettingsHeader />
        <SettingsContent 
          isLoading={isLoading} 
          settings={settings} 
          onSubmit={(data, onSuccessCallback) => {
            saveSettings(data, onSuccessCallback);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Settings;
