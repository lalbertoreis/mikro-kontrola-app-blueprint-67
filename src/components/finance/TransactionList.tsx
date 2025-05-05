
import React, { useState, useEffect } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  BadgePlus, 
  Pencil, 
  Trash2,
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Search
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Transaction, TransactionFormData, TransactionType } from "@/types/finance";
import { useTransactions } from "@/hooks/useTransactions";
import TransactionDialog from "./TransactionDialog";

const TransactionList = () => {
  const { transactions, isLoading, loadTransactions, removeTransaction } = useTransactions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "income" | "expense">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
  );

  // Filter transactions based on active filter, date range and search term
  useEffect(() => {
    let filtered = [...transactions];
    
    // Filter by type
    if (activeFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.type === activeFilter);
    }
    
    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter(
        transaction => transaction.date >= startDate && transaction.date <= endDate
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        transaction => 
          transaction.description.toLowerCase().includes(term) ||
          transaction.category.toLowerCase().includes(term) ||
          (transaction.clients?.name?.toLowerCase().includes(term)) ||
          (transaction.payment_method?.toLowerCase().includes(term))
      );
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, activeFilter, searchTerm, startDate, endDate]);

  const handleAdd = () => {
    setSelectedTransaction(null);
    setDialogOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await removeTransaction(id);
  };

  // Handle date filter change
  const handleDateFilterChange = () => {
    loadTransactions();
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Transações</h2>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <BadgePlus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Tabs 
          defaultValue="all" 
          value={activeFilter}
          onValueChange={(value) => setActiveFilter(value as "all" | "income" | "expense")}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[140px]"
              />
              <span>-</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[140px]"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDateFilterChange}
            >
              Filtrar
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <div className="rounded-md border overflow-x-auto">
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                    <div className="mt-2 text-muted-foreground">Carregando transações...</div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.description}
                      {transaction.clients && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Cliente: {transaction.clients.name}
                        </div>
                      )}
                    </TableCell>
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
                            onClick={() => handleEdit(transaction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipTrigger>
                        <TooltipContent>Excluir</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      <TransactionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        transactionId={selectedTransaction?.id}
        onSuccess={loadTransactions}
        initialData={selectedTransaction as TransactionFormData}
      />
    </div>
  );
};

export default TransactionList;
