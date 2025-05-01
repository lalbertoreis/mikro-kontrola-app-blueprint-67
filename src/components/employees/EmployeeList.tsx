
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
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Dados de exemplo para funcionários
const mockEmployees = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana.silva@exemplo.com",
    phone: "(11) 98765-4321",
    role: "Atendente",
    startDate: "2023-01-15",
    createdAt: "2023-01-10T14:30:00Z",
    updatedAt: "2023-01-10T14:30:00Z"
  },
  {
    id: "2",
    name: "Carlos Santos",
    email: "carlos.santos@exemplo.com",
    phone: "(11) 91234-5678",
    role: "Técnico",
    startDate: "2022-11-01",
    createdAt: "2022-10-25T10:15:00Z",
    updatedAt: "2022-10-25T10:15:00Z"
  }
];

const EmployeeList = () => {
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate("/dashboard/employees/new");
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/employees/${id}`);
  };

  const handleDelete = (id: string) => {
    // Na implementação real, aqui faria uma chamada para API para excluir
    console.log(`Excluir funcionário com ID: ${id}`);
    // E recarregaria os dados ou atualizaria o estado local
  };

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
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEmployees.length > 0 ? (
                mockEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>
                      {new Date(employee.startDate).toLocaleDateString('pt-BR')}
                    </TableCell>
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
                            onClick={() => handleDelete(employee.id)}
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
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
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
