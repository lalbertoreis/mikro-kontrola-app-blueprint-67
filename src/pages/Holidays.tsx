
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HolidayList from "@/components/holidays/HolidayList";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useHolidays } from "@/hooks/useHolidays";
import { HolidaySheet } from "@/components/holidays/HolidaySheet";
import { Holiday } from "@/types/holiday";
import { ImportHolidaysDialog } from "@/components/holidays/ImportHolidaysDialog";

const Holidays = () => {
  const { holidays, isLoading, error } = useHolidays();
  const [holidaySheetOpen, setHolidaySheetOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | undefined>(undefined);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  const handleAddHoliday = () => {
    setSelectedHoliday(undefined);
    setHolidaySheetOpen(true);
  };
  
  const handleEditHoliday = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setHolidaySheetOpen(true);
  };
  
  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
  };

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
          <Button onClick={handleAddHoliday}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            <span>Adicionar Feriado</span>
          </Button>
        </div>

        <HolidayList 
          holidays={holidays} 
          isLoading={isLoading} 
          onEdit={handleEditHoliday}
          onImport={handleOpenImportDialog}
        />

        <HolidaySheet 
          open={holidaySheetOpen} 
          onOpenChange={setHolidaySheetOpen} 
          holiday={selectedHoliday}
        />
        
        <ImportHolidaysDialog 
          open={importDialogOpen} 
          onOpenChange={setImportDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default Holidays;
