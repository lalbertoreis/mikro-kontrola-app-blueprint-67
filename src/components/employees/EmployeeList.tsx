
import React from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { Employee } from "@/types/employee";
import { formatDayOfWeek } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Pencil, Trash, UserPlus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EmployeeListProps {
  onEdit?: (id: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ onEdit }) => {
  const { employees, isLoading, deleteEmployee, isDeleting } = useEmployees();

  const handleEditEmployee = (id: string) => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        await deleteEmployee(id);
      } catch (error) {
        console.error("Erro ao excluir funcionário:", error);
      }
    }
  };

  // Função para criar a visualização de turnos por dia da semana
  const renderWeekSchedule = (shifts: Employee['shifts']) => {
    // Criar um mapa de dias da semana
    const weekDays = [0, 1, 2, 3, 4, 5, 6];
    const dayHasShift = weekDays.map(day => shifts.some(shift => shift.dayOfWeek === day));
    
    return (
      <div className="flex space-x-1.5">
        {weekDays.map((day, index) => {
          const letter = formatDayOfWeek(day).substring(0, 1);
          return (
            <Tooltip key={day}>
              <TooltipTrigger>
                <div 
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                    dayHasShift[index] 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {letter}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {dayHasShift[index] ? (
                  <div>
                    <p>{formatDayOfWeek(day)}</p>
                    {shifts
                      .filter(shift => shift.dayOfWeek === day)
                      .map((shift, i) => (
                        <p key={i} className="text-xs">
                          {shift.startTime} - {shift.endTime}
                          {shift.lunchBreakStart && ` (Almoço: ${shift.lunchBreakStart}-${shift.lunchBreakEnd})`}
                        </p>
                      ))
                    }
                  </div>
                ) : (
                  <p>{formatDayOfWeek(day)} - Folga</p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="hidden md:table-cell">Turnos</TableHead>
                  <TableHead className="hidden md:table-cell">Serviços</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length > 0 ? (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {renderWeekSchedule(employee.shifts)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {employee.services.length} serviços
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleEditEmployee(employee.id)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive" 
                            onClick={() => handleDelete(employee.id)}
                            disabled={isDeleting}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum funcionário cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default EmployeeList;
