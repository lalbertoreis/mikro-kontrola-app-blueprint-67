
import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, UserPlus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import EmployeeDialog from "./EmployeeDialog";

const EmployeeList: React.FC = () => {
  const { employees, isLoading, deleteEmployee, isDeleting } = useEmployees();
  const [open, setOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);

  const handleEditEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    setOpen(true);
  };

  const handleNewEmployee = () => {
    setSelectedEmployeeId(undefined);
    setOpen(true);
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

  // Função para resumir os turnos
  const summarizeShifts = (shifts: Employee['shifts']) => {
    const dayMap: Record<number, string[]> = {};
    
    shifts.forEach(shift => {
      const day = shift.dayOfWeek;
      if (!dayMap[day]) {
        dayMap[day] = [];
      }
      dayMap[day].push(`${shift.startTime}-${shift.endTime}`);
    });
    
    return Object.entries(dayMap).map(([day, times]) => {
      const dayName = formatDayOfWeek(parseInt(day));
      return `${dayName} (${times.join(', ')})`;
    }).join('; ');
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Lista de Funcionários</h2>
        <Button onClick={handleNewEmployee}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>

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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              {employee.shifts.length} turnos
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{summarizeShifts(employee.shifts)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {employee.services.length} serviços
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditEmployee(employee.id)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive" 
                              onClick={() => handleDelete(employee.id)}
                              disabled={isDeleting}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      <EmployeeDialog 
        open={open} 
        onOpenChange={setOpen} 
        employeeId={selectedEmployeeId} 
      />
    </>
  );
};

export default EmployeeList;
