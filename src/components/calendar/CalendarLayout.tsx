
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import CalendarSidebar from "./CalendarSidebar";
import CalendarMainHeader from "./CalendarMainHeader";
import { Employee } from "@/types/employee";
import { CalendarViewOptions } from "@/types/calendar";

interface CalendarLayoutProps {
  children: React.ReactNode;
  view: CalendarViewOptions["view"];
  onViewChange: (view: CalendarViewOptions["view"]) => void;
  employees: Employee[];
  selectedEmployeeId?: string;
  onEmployeeChange: (employeeId?: string) => void;
  hideCanceled: boolean;
  onToggleHideCanceled: () => void;
  onNewAppointment: () => void;
  onBlockTime: () => void;
  onGoToToday: () => void;
  currentDate: Date;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
}

const CalendarLayout: React.FC<CalendarLayoutProps> = ({
  children,
  view,
  onViewChange,
  employees,
  selectedEmployeeId,
  onEmployeeChange,
  hideCanceled,
  onToggleHideCanceled,
  onNewAppointment,
  onBlockTime,
  onGoToToday,
  currentDate,
  onNavigatePrevious,
  onNavigateNext,
}) => {
  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar - Fixed width but responsive */}
      <div className="w-72 lg:w-80 flex-shrink-0 p-3 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
        <CalendarSidebar
          view={view}
          onViewChange={onViewChange}
          employees={employees}
          selectedEmployeeId={selectedEmployeeId}
          onEmployeeChange={onEmployeeChange}
          hideCanceled={hideCanceled}
          onToggleHideCanceled={onToggleHideCanceled}
          onNewAppointment={onNewAppointment}
          onBlockTime={onBlockTime}
          onGoToToday={onGoToToday}
        />
      </div>

      {/* Main Content - Full width expansion */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
        {/* Header - Fixed height */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <CalendarMainHeader
            currentDate={currentDate}
            view={view}
            onNavigatePrevious={onNavigatePrevious}
            onNavigateNext={onNavigateNext}
            onToday={onGoToToday}
          />
        </div>

        {/* Calendar Content - Full expansion with no padding limitations */}
        <div className="flex-1 p-2 overflow-hidden w-full">
          <Card className="h-full w-full shadow-sm border-slate-200/50 bg-white dark:bg-slate-800">
            <CardContent className="p-0 h-full w-full overflow-hidden">
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarLayout;
