
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, DownloadCloud, Pencil } from "lucide-react";
import { Holiday } from "@/types/holiday";

interface HolidayListProps {
  holidays: Holiday[];
  isLoading: boolean;
  onEdit: (holiday: Holiday) => void;
  onImport: () => void;
}

const HolidayList: React.FC<HolidayListProps> = ({
  holidays,
  isLoading,
  onEdit,
  onImport
}) => {
  // Filter out system holidays
  const filteredHolidays = holidays.filter(holiday => 
    !holiday.name.includes("(Sistema)")
  );
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      national: "Nacional",
      state: "Estadual", 
      municipal: "Municipal",
      custom: "Personalizado"
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getTypeVariant = (type: string) => {
    const variants = {
      national: "default",
      state: "secondary",
      municipal: "outline", 
      custom: "destructive"
    };
    return variants[type as keyof typeof variants] || "default";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-4">
        <Button variant="outline" size="sm" onClick={onImport}>
          <DownloadCloud className="mr-2 h-4 w-4" />
          Importar Feriados
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHolidays.length > 0 ? (
              filteredHolidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell className="font-medium">{holiday.name}</TableCell>
                  <TableCell>{formatDate(holiday.date)}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(holiday.type) as any}>
                      {getTypeLabel(holiday.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(holiday)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhum feriado cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HolidayList;
