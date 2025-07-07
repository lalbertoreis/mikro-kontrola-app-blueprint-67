
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { BusinessSettingsFormData } from "@/types/settings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingSettingsFormProps {
  control: Control<BusinessSettingsFormData>;
}

const BookingSettingsForm: React.FC<BookingSettingsFormProps> = ({ control }) => {
  // Predefined options as per requirements
  const simultaneousLimitOptions = [1, 2, 3, 4, 5, 10];
  
  const futureLimitOptions = [
    { value: 0.25, label: '7 dias' },
    { value: 0.5, label: '15 dias' },
    { value: 1, label: '1 mês' },
    { value: 2, label: '2 meses' },
    { value: 3, label: '3 meses' },
    { value: 6, label: '6 meses' },
    { value: 12, label: '1 ano' }
  ];
  
  const timeIntervalOptions = [
    { value: 5, label: '5 minutos' },
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 120, label: '2 horas' }
  ];
  
  const cancelMinHoursOptions = [
    { value: 1, label: '1 hora' },
    { value: 2, label: '2 horas' },
    { value: 3, label: '3 horas' },
    { value: 4, label: '4 horas' },
    { value: 5, label: '5 horas' },
    { value: 6, label: '6 horas' },
    { value: 7, label: '7 horas' },
    { value: 8, label: '8 horas' },
    { value: 24, label: '1 dia' },
    { value: 48, label: '2 dias' },
    { value: 72, label: '3 dias' }
  ];
  
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
                  <TooltipContent side="top" className="max-w-xs">
                    <p>Quantidade de agendamentos futuros que um cliente pode manter simultaneamente.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Select
                value={field.value.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um limite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {simultaneousLimitOptions.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option === 1 ? `${option} agendamento` : `${option} agendamentos`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
              <FormLabel>Limite de tempo da agenda</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button" className="ml-1">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>Número máximo de meses no futuro que um cliente pode agendar um serviço.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Select
                value={field.value.toString()}
                onValueChange={(value) => field.onChange(parseFloat(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um limite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {futureLimitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
              <FormLabel>Intervalo de horários</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button" className="ml-1">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>Intervalo de horários disponíveis que aparecem na tela de horários do cliente.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Select
                value={field.value.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um intervalo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {timeIntervalOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
              <FormLabel>Tempo mínimo para cancelamento</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button" className="ml-1">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>Tempo limite antes do horário do agendamento para que o cliente possa realizar o cancelamento.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Select
                value={field.value.toString()}
                onValueChange={(value) => field.onChange(parseFloat(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um tempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {cancelMinHoursOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BookingSettingsForm;
