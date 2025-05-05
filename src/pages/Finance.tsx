
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FinancialSummary from "@/components/finance/FinancialSummary";
import TransactionList from "@/components/finance/TransactionList";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Finance = () => {
  const navigate = useNavigate();
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState<string>(firstDayOfMonth);
  const [endDate, setEndDate] = useState<string>(lastDayOfMonth);

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
              <p className="text-muted-foreground">
                Gerencie receitas, despesas e acompanhe seu fluxo financeiro.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/dashboard/payment-methods")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Métodos de Pagamento
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">De:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Até:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
          
          <FinancialSummary startDate={startDate} endDate={endDate} />
          <TransactionList startDate={startDate} endDate={endDate} />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Finance;
