
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, WalletCards } from "lucide-react";

// Dados de exemplo para resumo financeiro
const mockSummary = {
  totalIncome: 15750.50,
  totalExpenses: 9340.75,
  balance: 6409.75,
  periodStart: "2023-05-01",
  periodEnd: "2023-05-31",
};

const FinancialSummary = () => {
  // Na implementação real, aqui buscaríamos os dados do resumo financeiro
  const summary = mockSummary;
  
  // Formatar valores como moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receitas
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Período: {new Date(summary.periodStart).toLocaleDateString('pt-BR')} a {new Date(summary.periodEnd).toLocaleDateString('pt-BR')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas
          </CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Período: {new Date(summary.periodStart).toLocaleDateString('pt-BR')} a {new Date(summary.periodEnd).toLocaleDateString('pt-BR')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo
          </CardTitle>
          <WalletCards className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(summary.balance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Período: {new Date(summary.periodStart).toLocaleDateString('pt-BR')} a {new Date(summary.periodEnd).toLocaleDateString('pt-BR')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;
