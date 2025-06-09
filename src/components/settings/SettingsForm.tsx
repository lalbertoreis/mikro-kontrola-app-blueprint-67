
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BusinessSettingsFormData } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Calendar } from "lucide-react";
import { toast } from "sonner";
import { settingsFormSchema } from "./ValidationSchema";
import BusinessInfoForm from "./BusinessInfoForm";
import OnlineBookingForm from "./OnlineBookingForm";
import BookingSettingsForm from "./BookingSettingsForm";
import SubscriptionPlan from "./SubscriptionPlan";

interface SettingsFormProps {
  defaultValues?: Partial<BusinessSettingsFormData>;
  onSubmit?: (data: BusinessSettingsFormData) => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({
  defaultValues = {
    businessName: "",
    businessLogo: "",
    enableOnlineBooking: false,
    slug: "",
    instagram: "",
    whatsapp: "",
    address: "",
    bookingSimultaneousLimit: 3,
    bookingFutureLimit: 3,
    bookingTimeInterval: 30,
    bookingCancelMinHours: 1,
    bookingColor: "#9b87f5",
  },
  onSubmit = () => {},
}) => {
  const form = useForm<BusinessSettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  const watchEnableOnlineBooking = form.watch("enableOnlineBooking");
  const watchBusinessLogo = form.watch("businessLogo");

  const handleSubmit = (data: BusinessSettingsFormData) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      {/* Subscription Plan Section */}
      <SubscriptionPlan />
      
      {/* Settings Forms */}
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
              <BusinessInfoForm 
                control={form.control} 
                watchEnableOnlineBooking={watchEnableOnlineBooking} 
                watchBusinessLogo={watchBusinessLogo}
              />
            </CardContent>
          </Card>

          {watchEnableOnlineBooking && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Informações para Agenda Online</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <OnlineBookingForm control={form.control} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>Configurações de Agendamento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BookingSettingsForm control={form.control} />
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex justify-end">
            <Button type="submit">Salvar Configurações</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SettingsForm;
