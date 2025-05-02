
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEmployees } from "@/hooks/useEmployees";
import { toast } from "sonner";

const EmployeeList = () => {
  const navigate = useNavigate();
  const { employees, isLoading, error, deleteEmployee } = useEmployees();

  const handleAdd = () => {
    navigate("/dashboard/employees/new");
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/employees/${id}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o funcionário "${name}"?`)) {
      try {
        await deleteEmployee(id);
        toast.success(`Funcionário "${name}" excluído com sucesso.`);
      } catch (error) {
        toast.error("Erro ao excluir funcionário.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Erro ao carregar funcionários. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar Funcionário
        </Button>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.services.length} serviços</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(employee.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(employee.id, employee.name)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    Nenhum funcionário cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeList;
