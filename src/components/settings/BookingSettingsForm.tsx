
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { BusinessSettingsFormData } from "@/types/settings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface BookingSettingsFormProps {
  control: Control<BusinessSettingsFormData>;
}

const BookingSettingsForm: React.FC<BookingSettingsFormProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="bookingSimultaneousLimit"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center">
              <FormLabel>Limite de agendamentos simultâneos</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button" className="ml-1">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">Quantidade de agendamentos futuros que um cliente pode manter simultaneamente.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="bookingFutureLimit"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center">
              <FormLabel>Limite de tempo da agenda (meses)</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button" className="ml-1">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">Número máximo de meses no futuro que um cliente pode agendar um serviço.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="bookingTimeInterval"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center">
              <FormLabel>Intervalo de horários (minutos)</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button" className="ml-1">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">Intervalo de horários disponíveis que aparecem na tela de horários do cliente.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Input
                type="number"
                min={5}
                step={5}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="bookingCancelMinHours"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center">
              <FormLabel>Tempo mínimo para cancelamento (horas)</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button" className="ml-1">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">Tempo limite antes do horário do agendamento para que o cliente possa realizar o cancelamento.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Input
                type="number"
                min={0}
                step={0.5}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BookingSettingsForm;
