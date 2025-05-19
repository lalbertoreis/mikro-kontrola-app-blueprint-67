
import React from "react";
import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HolidayFormValues } from "../SimplifiedHolidayForm";

interface HolidayFormCustomTimesProps {
  form: UseFormReturn<HolidayFormValues>;
}

export const HolidayFormCustomTimes: React.FC<HolidayFormCustomTimesProps> = ({
  form,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="customStartTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horário Inicial</FormLabel>
            <FormControl>
              <Input type="time" {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customEndTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horário Final</FormLabel>
            <FormControl>
              <Input type="time" {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
