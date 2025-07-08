
import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SettingsForm from "@/components/settings/SettingsForm";
import { BusinessSettingsFormData } from "@/types/settings";

interface SettingsContentProps {
  isLoading: boolean;
  settings: any;
  onSubmit: (data: BusinessSettingsFormData, onSuccessCallback?: () => void) => void;
}

const SettingsContent: React.FC<SettingsContentProps> = ({ 
  isLoading, 
  settings, 
  onSubmit 
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get('tab') || 'subscription';
  
  const handleSubmit = (data: BusinessSettingsFormData) => {
    // Se estivermos na tab business e a agenda online foi habilitada
    const wasOnlineBookingDisabled = !settings.enableOnlineBooking;
    const isEnablingOnlineBooking = data.enableOnlineBooking && wasOnlineBookingDisabled;
    
    if (currentTab === 'business' && isEnablingOnlineBooking) {
      // Redirect to online-booking tab after successful save
      onSubmit(data, () => {
        navigate('/dashboard/settings?tab=online-booking', { replace: true });
      });
    } else {
      onSubmit(data);
    }
  };

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
      onSubmit={handleSubmit}
    />
  );
};

export default SettingsContent;
