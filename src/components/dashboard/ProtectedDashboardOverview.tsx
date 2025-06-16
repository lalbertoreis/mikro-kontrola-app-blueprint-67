
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalClients: number;
  totalAppointments: number;
  monthlyRevenue: number;
  completedAppointments: number;
}

const ProtectedDashboardOverview = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error("User not authenticated");

      console.log("Fetching dashboard stats for user:", user.id);

      // Use the new database function for better performance
      const { data, error } = await supabase
        .rpc('get_dashboard_stats', { user_id_param: user.id });

      if (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          totalClients: 0,
          totalAppointments: 0,
          monthlyRevenue: 0,
          completedAppointments: 0
        };
      }

      const stats = data[0];
      const result = {
        totalClients: Number(stats.total_clients || 0),
        totalAppointments: Number(stats.total_appointments || 0),
        monthlyRevenue: Number(stats.monthly_revenue || 0),
        completedAppointments: Number(stats.completed_appointments || 0)
      };

      console.log("Dashboard stats for user:", user.id, result);
      return result;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (!user) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Você precisa estar logado para ver o dashboard.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const defaultStats: DashboardStats = {
    totalClients: 0,
    totalAppointments: 0,
    monthlyRevenue: 0,
    completedAppointments: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.totalClients}</div>
          <p className="text-xs text-muted-foreground">
            Clientes cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.totalAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Total de agendamentos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {currentStats.monthlyRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Receita do mês atual
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendamentos Concluídos</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.completedAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Serviços realizados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProtectedDashboardOverview;
