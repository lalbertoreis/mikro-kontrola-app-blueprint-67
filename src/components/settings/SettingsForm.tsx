
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BusinessSettingsFormData } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { settingsFormSchema } from "./ValidationSchema";
import SettingsTabs from "./SettingsTabs";

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <SettingsTabs 
            control={form.control}
            watchEnableOnlineBooking={watchEnableOnlineBooking}
            watchBusinessLogo={watchBusinessLogo}
          />

          <div className="flex justify-end">
            <Button type="submit">Salvar Configurações</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SettingsForm;
