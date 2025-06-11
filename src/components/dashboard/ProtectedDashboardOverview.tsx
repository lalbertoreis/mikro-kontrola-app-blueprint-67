
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

      // Get current month for revenue calculation
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Fetch stats with RLS automatically filtering by user_id
      const [clientsResult, appointmentsResult, revenueResult, completedResult] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'income')
          .gte('date', firstDayOfMonth)
          .lte('date', lastDayOfMonth),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'completed')
      ]);

      // Calculate monthly revenue
      const monthlyRevenue = revenueResult.data?.reduce((sum, transaction) => 
        sum + Number(transaction.amount), 0) || 0;

      const stats = {
        totalClients: clientsResult.count || 0,
        totalAppointments: appointmentsResult.count || 0,
        monthlyRevenue,
        completedAppointments: completedResult.count || 0
      };

      console.log("Dashboard stats for user:", user.id, stats);
      return stats;
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
