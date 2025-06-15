
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface CalendarViewHeaderProps {
  loading: boolean;
  user: any;
}

const CalendarViewHeader: React.FC<CalendarViewHeaderProps> = ({ loading, user }) => {
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-slate-600 dark:text-slate-400">Carregando agenda...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-10 text-muted-foreground">
          Você precisa estar logado para ver a agenda.
        </div>
      </DashboardLayout>
    );
  }

  return null;
};

export default CalendarViewHeader;
