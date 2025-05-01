
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
import { 
  BadgePlus, 
  Pencil, 
  Trash2,
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TransactionType } from "@/types/finance";

// Dados de exemplo para transações
const mockTransactions = [
  {
    id: "1",
    description: "Pagamento Cliente XYZ",
    amount: 2500.00,
    date: "2023-05-15",
    type: "income" as TransactionType,
    category: "Serviços",
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-05-15T10:30:00Z"
  },
  {
    id: "2",
    description: "Compra de Material",
    amount: 850.75,
    date: "2023-05-10",
    type: "expense" as TransactionType,
    category: "Materiais",
    createdAt: "2023-05-10T14:15:00Z",
    updatedAt: "2023-05-10T14:15:00Z"
  },
  {
    id: "3",
    description: "Pagamento Cliente ABC",
    amount: 1800.00,
    date: "2023-05-18",
    type: "income" as TransactionType,
    category: "Serviços",
    createdAt: "2023-05-18T09:45:00Z",
    updatedAt: "2023-05-18T09:45:00Z"
  },
  {
    id: "4",
    description: "Aluguel",
    amount: 1500.00,
    date: "2023-05-05",
    type: "expense" as TransactionType,
    category: "Infraestrutura",
    createdAt: "2023-05-05T08:30:00Z",
    updatedAt: "2023-05-05T08:30:00Z"
  }
];

const TransactionList = () => {
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate("/dashboard/finance/new");
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/finance/${id}`);
  };

  const handleDelete = (id: string) => {
    // Na implementação real, aqui faria uma chamada para API para excluir
    console.log(`Excluir transação com ID: ${id}`);
    // E recarregaria os dados ou atualizaria o estado local
  };

  // Formatar valores como moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transações Recentes</h2>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <BadgePlus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.length > 0 ? (
                mockTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-2 text-red-500" />
                        )}
                        <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                          {transaction.type === "income" ? "Receita" : "Despesa"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(transaction.id)}
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
                            onClick={() => handleDelete(transaction.id)}
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
                    Nenhuma transação registrada.
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

export default TransactionList;
