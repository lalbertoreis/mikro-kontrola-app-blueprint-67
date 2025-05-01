
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TransactionFormComponent from "@/components/finance/TransactionForm";

const TransactionForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const handleSuccess = () => {
    toast({
      title: isEditing ? "Transação atualizada" : "Transação adicionada",
      description: isEditing 
        ? "As informações da transação foram atualizadas com sucesso." 
        : "A transação foi adicionada com sucesso.",
    });
    navigate("/dashboard/finance");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Editar Transação" : "Adicionar Transação"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Atualize as informações da transação abaixo." 
              : "Preencha as informações para adicionar uma nova transação."}
          </p>
        </div>
        
        <TransactionFormComponent transactionId={id} onSuccess={handleSuccess} />
      </div>
    </DashboardLayout>
  );
};

export default TransactionForm;
