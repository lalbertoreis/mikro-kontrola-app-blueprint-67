
import React from "react";
import { useNavigate } from "react-router-dom";
import { Holiday } from "@/types/holiday";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Edit,
  Trash,
  Check,
  X,
  Loader2,
  CalendarRange,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useHolidays } from "@/hooks/useHolidays";

interface HolidayListProps {
  holidays: Holiday[];
  isLoading: boolean;
}

const HolidayList: React.FC<HolidayListProps> = ({ holidays, isLoading }) => {
  const navigate = useNavigate();
  const { deleteHoliday } = useHolidays();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o feriado "${name}"?`)) {
      try {
        await deleteHoliday(id);
        toast.success(`Feriado "${name}" excluído com sucesso.`);
      } catch (error) {
        toast.error("Erro ao excluir feriado.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (holidays.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed">
        <CalendarRange className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Nenhum feriado cadastrado</p>
        <Button 
          variant="link" 
          onClick={() => navigate("/dashboard/holidays/new")}
        >
          Adicionar feriado
        </Button>
      </div>
    );
  }

  const getHolidayTypeBadge = (type: string) => {
    switch (type) {
      case "national":
        return <Badge variant="default">Nacional</Badge>;
      case "state":
        return <Badge variant="secondary">Estadual</Badge>;
      case "municipal":
        return <Badge variant="outline">Municipal</Badge>;
      case "custom":
        return <Badge variant="destructive">Personalizado</Badge>;
      default:
        return null;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Ativo</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holidays.map((holiday) => (
          <TableRow key={holiday.id}>
            <TableCell>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                {format(new Date(holiday.date), "dd/MM/yyyy")}
              </div>
            </TableCell>
            <TableCell>{holiday.name}</TableCell>
            <TableCell>{getHolidayTypeBadge(holiday.type)}</TableCell>
            <TableCell>
              {holiday.isActive ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/dashboard/holidays/${holiday.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDelete(holiday.id, holiday.name)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default HolidayList;
