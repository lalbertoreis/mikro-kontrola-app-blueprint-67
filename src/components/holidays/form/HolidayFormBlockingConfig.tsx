
import React from "react";
import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HolidayFormValues } from "../SimplifiedHolidayForm";

interface HolidayFormBlockingConfigProps {
  form: UseFormReturn<HolidayFormValues>;
}

export const HolidayFormBlockingConfig: React.FC<HolidayFormBlockingConfigProps> = ({
  form,
}) => {
  return (
    <FormField
      control={form.control}
      name="blockingType"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Período de Bloqueio</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full_day" id="full_day" />
                <FormLabel htmlFor="full_day" className="font-normal cursor-pointer">
                  Dia inteiro
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="morning" id="morning" />
                <FormLabel htmlFor="morning" className="font-normal cursor-pointer">
                  Manhã (até 12:00)
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="afternoon" id="afternoon" />
                <FormLabel htmlFor="afternoon" className="font-normal cursor-pointer">
                  Tarde (após 12:00)
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <FormLabel htmlFor="custom" className="font-normal cursor-pointer">
                  Personalizado
                </FormLabel>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
