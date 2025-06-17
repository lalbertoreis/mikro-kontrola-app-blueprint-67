
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useAverageServiceCost } from "@/hooks/useDashboardAnalytics";

const AverageServiceCostCard = () => {
  const [period, setPeriod] = useState("30");
  const { data, isLoading } = useAverageServiceCost(Number(period));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Custo Médio dos Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Custo Médio dos Serviços
        </CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 dias</SelectItem>
            <SelectItem value="30">30 dias</SelectItem>
            <SelectItem value="90">90 dias</SelectItem>
            <SelectItem value="365">1 ano</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              R$ {Number(data?.average_cost || 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Valor médio por serviço</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Agendamentos
              </div>
              <div className="text-lg font-semibold">
                {data?.total_appointments || 0}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Receita Total
              </div>
              <div className="text-lg font-semibold text-green-600">
                R$ {Number(data?.total_revenue || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AverageServiceCostCard;
