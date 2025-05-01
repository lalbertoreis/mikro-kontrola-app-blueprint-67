
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CalendarView from "@/components/calendar/CalendarView";
import { TooltipProvider } from "@/components/ui/tooltip";

const Calendar = () => {
  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os agendamentos.
          </p>
          
          <CalendarView />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Calendar;
