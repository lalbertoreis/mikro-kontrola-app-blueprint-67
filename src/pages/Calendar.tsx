
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CalendarView from "@/components/calendar/CalendarView";
import { TooltipProvider } from "@/components/ui/tooltip";

const Calendar = () => {
  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="h-full w-full -m-4 md:-m-6">
          <CalendarView />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Calendar;
