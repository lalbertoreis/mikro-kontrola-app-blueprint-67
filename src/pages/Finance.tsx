
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FinancialSummary from "@/components/finance/FinancialSummary";
import TransactionList from "@/components/finance/TransactionList";
import { TooltipProvider } from "@/components/ui/tooltip";

const Finance = () => {
  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Gerencie receitas, despesas e acompanhe seu fluxo financeiro.
          </p>
          
          <FinancialSummary />
          <TransactionList />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Finance;
