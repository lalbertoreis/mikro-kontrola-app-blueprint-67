
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { useGrowthTrends } from "@/hooks/useDashboardAnalytics";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const GrowthTrendsChart = () => {
  const [period, setPeriod] = useState("90");
  const { data: trendsData = [], isLoading } = useGrowthTrends(Number(period));

  const chartData = trendsData.map(day => ({
    date: format(new Date(day.date_period), "dd/MM", { locale: ptBR }),
    fullDate: format(new Date(day.date_period), "dd/MM/yyyy", { locale: ptBR }),
    newClients: Number(day.new_clients),
    appointments: Number(day.total_appointments),
    completed: Number(day.completed_appointments),
    revenue: Number(day.revenue),
    totalClients: Number(day.cumulative_clients)
  }));

  const totalGrowth = {
    clients: chartData.length > 0 ? chartData[chartData.length - 1].totalClients - chartData[0].totalClients : 0,
    revenue: chartData.reduce((sum, day) => sum + day.revenue, 0),
    appointments: chartData.reduce((sum, day) => sum + day.appointments, 0)
  };

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendências de Crescimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Tendências de Crescimento
        </CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 dias</SelectItem>
            <SelectItem value="90">90 dias</SelectItem>
            <SelectItem value="180">6 meses</SelectItem>
            <SelectItem value="365">1 ano</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">+{totalGrowth.clients}</div>
            <p className="text-sm text-blue-600">Novos Clientes</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              R$ {totalGrowth.revenue.toFixed(2)}
            </div>
            <p className="text-sm text-green-600">Receita Total</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalGrowth.appointments}</div>
            <p className="text-sm text-purple-600">Agendamentos</p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum dado encontrado no período
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                interval={Math.ceil(chartData.length / 10)}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'revenue') return [`R$ ${Number(value).toFixed(2)}`, 'Receita'];
                  if (name === 'totalClients') return [value, 'Total de Clientes'];
                  if (name === 'appointments') return [value, 'Agendamentos'];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.date === label);
                  return item?.fullDate;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalClients" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="totalClients"
                dot={{ r: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={2}
                name="revenue"
                dot={{ r: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="appointments" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="appointments"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default GrowthTrendsChart;
