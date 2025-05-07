
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarViewOptions } from "@/types/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CalendarHeaderProps {
  view: CalendarViewOptions["view"];
  onViewChange: (view: CalendarViewOptions["view"]) => void;
  onNewAppointment: () => void;
  onBlockTime: () => void;
  hideCanceled: boolean;
  onToggleHideCanceled: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  view,
  onViewChange,
  onNewAppointment,
  onBlockTime,
  hideCanceled,
  onToggleHideCanceled,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs 
          defaultValue={view} 
          onValueChange={(v) => onViewChange(v as "week" | "month")}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800">
            <TabsTrigger 
              value="week" 
              className="font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              Semana
            </TabsTrigger>
            <TabsTrigger 
              value="month"
              className="font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              Mês
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onBlockTime}
            className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Bloquear Horário
          </Button>
          <Button 
            onClick={onNewAppointment}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Agendar
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md border border-slate-200 dark:border-slate-700/50">
        <Switch 
          id="hide-canceled" 
          checked={hideCanceled} 
          onCheckedChange={onToggleHideCanceled}
          className="data-[state=checked]:bg-blue-600"
        />
        <Label 
          htmlFor="hide-canceled"
          className="text-slate-700 dark:text-slate-300 text-sm font-medium cursor-pointer"
        >
          Ocultar agendamentos cancelados
        </Label>
      </div>
    </div>
  );
};

export default CalendarHeader;
