
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarViewOptions } from "@/types/calendar";

interface CalendarHeaderProps {
  view: CalendarViewOptions["view"];
  onViewChange: (view: CalendarViewOptions["view"]) => void;
  onNewAppointment: () => void;
  onBlockTime: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  view,
  onViewChange,
  onNewAppointment,
  onBlockTime,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <Tabs defaultValue={view} onValueChange={(v) => onViewChange(v as "week" | "month")}>
        <TabsList>
          <TabsTrigger value="week">Semana</TabsTrigger>
          <TabsTrigger value="month">Mês</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={onBlockTime}
        >
          Bloquear Horário
        </Button>
        <Button onClick={onNewAppointment}>
          <Plus className="mr-2 h-4 w-4" /> Agendar
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
