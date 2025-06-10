
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import CalendarView from "@/components/calendar/CalendarView";

const Calendar = () => {
  return (
    <TooltipProvider>
      <div className="h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
        <CalendarView />
      </div>
    </TooltipProvider>
  );
};

export default Calendar;
