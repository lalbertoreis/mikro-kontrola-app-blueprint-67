
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, WalletCards } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";

interface FinancialSummaryProps {
  startDate?: string;
  endDate?: string;
}

const FinancialSummary = ({ startDate, endDate }: FinancialSummaryProps) => {
  const { summary, isLoading, loadSummary } = useTransactions();
  
  // Carregar o resumo quando as datas mudarem
  React.useEffect(() => {
    loadSummary(startDate, endDate);
  }, [startDate, endDate, loadSummary]);
  
  // Formatar valores como moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="h-4 bg-muted rounded w-20"></CardTitle>
              <div className="h-4 w-4 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-32 mb-2"></div>
              <div className="h-3 bg-muted rounded w-40"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Nenhum dado financeiro disponível.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
