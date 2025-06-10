
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 max-w-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 p-1 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="px-2 py-1 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
          <CalendarMainHeader
            currentDate={currentDate}
            view={view}
            onNavigatePrevious={onNavigatePrevious}
            onNavigateNext={onNavigateNext}
            onToday={onGoToToday}
          />
        </div>

        {/* Calendar Content */}
        <div className="flex-1 p-1 overflow-auto">
          <Card className="h-full max-w-none shadow-sm border-slate-200/50">
            <CardContent className="p-0 h-full">
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarLayout;
