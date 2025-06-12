
import React from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Calendar, CreditCard } from "lucide-react";
import { BusinessSettingsFormData } from "@/types/settings";
import SubscriptionPlan from "./SubscriptionPlan";
import BusinessInfoForm from "./BusinessInfoForm";
import OnlineBookingForm from "./OnlineBookingForm";
import BookingSettingsForm from "./BookingSettingsForm";
import { Control } from "react-hook-form";

interface SettingsTabsProps {
  control: Control<BusinessSettingsFormData>;
  watchEnableOnlineBooking: boolean;
  watchBusinessLogo?: string;
}

type ValidTabs = 'subscription' | 'business' | 'online-booking' | 'booking-settings';

const SettingsTabs: React.FC<SettingsTabsProps> = ({
  control,
  watchEnableOnlineBooking,
  watchBusinessLogo
}) => {
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as ValidTabs) || 'subscription';

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="subscription" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">Plano</span>
        </TabsTrigger>
        <TabsTrigger value="business" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Negócio</span>
        </TabsTrigger>
        <TabsTrigger value="online-booking" className="flex items-center gap-2" disabled={!watchEnableOnlineBooking}>
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Agenda Online</span>
        </TabsTrigger>
        <TabsTrigger value="booking-settings" className="flex items-center gap-2" disabled={!watchEnableOnlineBooking}>
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Configurações</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="subscription" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plano de Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionPlan />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="business" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informações do Negócio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BusinessInfoForm 
              control={control} 
              watchEnableOnlineBooking={watchEnableOnlineBooking} 
              watchBusinessLogo={watchBusinessLogo}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="online-booking" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações para Agenda Online</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <OnlineBookingForm control={control} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="booking-settings" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configurações de Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BookingSettingsForm control={control} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
