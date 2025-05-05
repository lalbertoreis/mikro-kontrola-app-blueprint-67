
import React from "react";
import SettingsForm from "@/components/settings/SettingsForm";
import { BusinessSettingsFormData } from "@/types/settings";

interface SettingsContentProps {
  isLoading: boolean;
  settings: any;
  onSubmit: (data: BusinessSettingsFormData) => void;
}

const SettingsContent: React.FC<SettingsContentProps> = ({ 
  isLoading, 
  settings, 
  onSubmit 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <SettingsForm
      defaultValues={{
        businessName: settings.businessName,
        businessLogo: settings.businessLogo,
        enableOnlineBooking: settings.enableOnlineBooking,
        slug: settings.slug,
        instagram: settings.instagram,
        whatsapp: settings.whatsapp,
        address: settings.address,
        bookingSimultaneousLimit: settings.bookingSimultaneousLimit,
        bookingFutureLimit: settings.bookingFutureLimit,
        bookingTimeInterval: settings.bookingTimeInterval,
        bookingCancelMinHours: settings.bookingCancelMinHours,
      }}
      onSubmit={onSubmit}
    />
  );
};

export default SettingsContent;
