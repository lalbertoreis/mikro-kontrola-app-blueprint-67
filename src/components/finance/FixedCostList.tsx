
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash, 
  Loader2, 
  CreditCard,
  Plus 
} from "lucide-react";
import { useFixedCosts } from "@/hooks/useFixedCosts";
import { FixedCostDialog } from "./FixedCostDialog";
import { FixedCost } from "@/types/fixedCost";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const FixedCostList = () => {
  const { fixedCosts, isLoading, deleteFixedCost, isDeleting } = useFixedCosts();
  const [selectedFixedCost, setSelectedFixedCost] = useState<FixedCost | undefined>(
    undefined
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleAddClick = () => {
    setSelectedFixedCost(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (fixedCost: FixedCost) => {
    setSelectedFixedCost(fixedCost);
    setDialogOpen(true);
  };

  const handleDeleteClick = (fixedCost: FixedCost) => {
    setSelectedFixedCost(fixedCost);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedFixedCost) {
      deleteFixedCost(selectedFixedCost.id);
    }
    setDeleteDialogOpen(false);
  };

  // Format currency to BRL
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Get month name from number
  const getMonthName = (monthNumber: number) => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return months[monthNumber - 1];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-kontrola-600" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Custos Fixos</h2>
        <Button 
          onClick={handleAddClick}
          className="bg-kontrola-600 hover:bg-kontrola-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Mês/Ano</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixedCosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <CreditCard className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Nenhum custo fixo cadastrado
                    </p>
                    <Button 
                      onClick={handleAddClick}
                      className="mt-2 bg-kontrola-600 hover:bg-kontrola-700"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Adicionar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              fixedCosts.map((fixedCost) => (
                <TableRow key={fixedCost.id}>
                  <TableCell className="font-medium">{fixedCost.name}</TableCell>
                  <TableCell>{getMonthName(fixedCost.month)}/{fixedCost.year}</TableCell>
                  <TableCell>{formatCurrency(fixedCost.amount)}</TableCell>
                  <TableCell>{fixedCost.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(fixedCost)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(fixedCost)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FixedCostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fixedCost={selectedFixedCost}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o custo fixo "{selectedFixedCost?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
