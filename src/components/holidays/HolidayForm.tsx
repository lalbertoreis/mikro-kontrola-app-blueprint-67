
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Holiday, HolidayFormData, HolidayType } from "@/types/holiday";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const holidayFormSchema = z.object({
  date: z.date({
    required_error: "Selecione uma data para o feriado",
  }),
  name: z.string().min(2, {
    message: "O nome do feriado deve ter pelo menos 2 caracteres",
  }),
  type: z.enum(["national", "state", "municipal", "custom"], {
    required_error: "Selecione um tipo de feriado",
  }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface HolidayFormProps {
  defaultValues?: Partial<HolidayFormData>;
  onCancel?: () => void;
}

const HolidayForm: React.FC<HolidayFormProps> = ({
  defaultValues = {
    date: new Date(),
    name: "",
    type: "national" as HolidayType,
    description: "",
    isActive: true,
  },
  onCancel,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showBrasilApiOptions, setShowBrasilApiOptions] = useState(false);

  const form = useForm<HolidayFormData>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues,
  });

  const handleFetchBrasilApi = async () => {
    setIsLoading(true);
    try {
      const year = new Date().getFullYear();
      // Em uma implementação real, faríamos a chamada para a API
      // https://brasilapi.com.br/api/feriados/v1/2023
      toast.info("Buscando feriados nacionais...");
      
      // Simulando uma resposta
      setTimeout(() => {
        toast.success("Feriados buscados com sucesso!");
        setShowBrasilApiOptions(true);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast.error("Erro ao buscar feriados nacionais");
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: HolidayFormData) => {
    setIsLoading(true);
    try {
      // Em uma implementação real, enviaríamos para o backend
      console.log(data);
      toast.success("Feriado salvo com sucesso!");
      navigate("/dashboard/holidays");
    } catch (error) {
      toast.error("Erro ao salvar feriado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do feriado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo do feriado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="national">Nacional</SelectItem>
                        <SelectItem value="state">Estadual</SelectItem>
                        <SelectItem value="municipal">Municipal</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição do feriado (opcional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>
                        Desative para que o feriado não seja considerado na agenda
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFetchBrasilApi}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Buscar Feriados Nacionais
                </Button>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Salvar
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {showBrasilApiOptions && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Feriados Nacionais</h3>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Selecione os feriados nacionais que deseja adicionar:
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="holiday-1" className="rounded" />
                  <label htmlFor="holiday-1">01/01/2024 - Ano Novo</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="holiday-2" className="rounded" />
                  <label htmlFor="holiday-2">12/02/2024 - Carnaval</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="holiday-3" className="rounded" />
                  <label htmlFor="holiday-3">29/03/2024 - Sexta-feira Santa</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="holiday-4" className="rounded" />
                  <label htmlFor="holiday-4">21/04/2024 - Tiradentes</label>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button>Importar Selecionados</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HolidayForm;
