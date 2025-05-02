
import React from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HolidayList from "@/components/holidays/HolidayList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";

const Holidays = () => {
  const { data: holidays = [], isLoading, error } = useQuery({
    queryKey: ["holidays"],
    queryFn: async () => {
      // Em uma implementação real, buscaríamos do backend
      // Por enquanto, retornamos um array vazio
      return [];
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Feriados</h1>
            <p className="text-muted-foreground">
              Gerencie os feriados para bloqueio da agenda.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/holidays/new">
              <CalendarPlus className="mr-2 h-4 w-4" />
              <span>Adicionar Feriado</span>
            </Link>
          </Button>
        </div>

        <HolidayList holidays={holidays} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default Holidays;
