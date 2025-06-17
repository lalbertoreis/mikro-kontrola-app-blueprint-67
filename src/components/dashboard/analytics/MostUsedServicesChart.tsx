
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { useMostUsedServices } from "@/hooks/useDashboardAnalytics";

const MostUsedServicesChart = () => {
  const [period, setPeriod] = useState("30");
  const { data: services = [], isLoading } = useMostUsedServices(Number(period));

  const chartData = services.slice(0, 5).map(service => ({
    name: service.service_name.length > 15 
      ? service.service_name.substring(0, 15) + "..." 
      : service.service_name,
    fullName: service.service_name,
    count: Number(service.usage_count),
    revenue: Number(service.total_revenue)
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Serviços Mais Usados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Serviços Mais Usados
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
        {chartData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum serviço encontrado no período
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'count' ? `${value} agendamentos` : `R$ ${Number(value).toFixed(2)}`,
                  name === 'count' ? 'Quantidade' : 'Receita'
                ]}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.name === label);
                  return item?.fullName || label;
                }}
              />
              <Bar dataKey="count" fill="#8884d8" name="count" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default MostUsedServicesChart;
