
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import { useOccupationRate } from "@/hooks/useDashboardAnalytics";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const OccupationRateChart = () => {
  const [period, setPeriod] = useState("30");
  const { data: occupationData = [], isLoading } = useOccupationRate(Number(period));

  const chartData = occupationData.map(day => ({
    date: format(new Date(day.date_period), "dd/MM", { locale: ptBR }),
    fullDate: format(new Date(day.date_period), "dd/MM/yyyy", { locale: ptBR }),
    rate: Number(day.occupation_rate),
    booked: day.booked_slots,
    total: day.total_slots,
    revenue: Number(day.revenue)
  }));

  const averageRate = chartData.length > 0 
    ? chartData.reduce((sum, day) => sum + day.rate, 0) / chartData.length 
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Taxa de Ocupação
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
          <Activity className="h-5 w-5" />
          Taxa de Ocupação
        </CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 dias</SelectItem>
            <SelectItem value="30">30 dias</SelectItem>
            <SelectItem value="90">90 dias</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-2xl font-bold">
            {averageRate.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground">
            Taxa média de ocupação no período
          </p>
        </div>
        
        {chartData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum dado encontrado no período
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                interval={Math.ceil(chartData.length / 7)}
              />
              <YAxis 
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Taxa de Ocupação']}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.date === label);
                  return `${item?.fullDate} - ${item?.booked}/${item?.total} slots`;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default OccupationRateChart;
