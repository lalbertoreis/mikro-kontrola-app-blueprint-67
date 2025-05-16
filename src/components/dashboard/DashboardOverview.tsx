import React, { useEffect, useState } from "react";
import { Loader2, Calendar, Users, CreditCard, BellRing, TrendingUp, Activity, Scissors, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    mostBookedService: "",
    occupancyRate: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get today's date and week boundaries
        const today = new Date();
        const todayISOString = today.toISOString().split('T')[0];
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const firstDayOfMonth = startOfMonth(today).toISOString();
        const lastDayOfMonth = endOfMonth(today).toISOString();
        
        // Fetch today's appointments
        const { data: todayAppts, error: todayApptError } = await supabase
          .from('appointments')
          .select('*')
          .gte('start_time', `${todayISOString}T00:00:00`)
          .lte('start_time', `${todayISOString}T23:59:59`);
        
        if (todayApptError) throw todayApptError;

        // Fetch week's appointments
        const weekStart = new Date();
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date();
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const { data: weekAppts, error: weekApptError } = await supabase
          .from('appointments')
          .select('*')
          .gte('start_time', weekStart.toISOString())
          .lte('start_time', weekEnd.toISOString());
          
        if (weekApptError) throw weekApptError;
        
        // Fetch clients count
        const { count: clientsCount, error: clientsError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });
        
        if (clientsError) throw clientsError;

        // Fetch monthly revenue
        const { data: monthlyTransactions, error: transactionError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'income')
          .gte('date', firstDayOfMonth)
          .lte('date', lastDayOfMonth);
        
        if (transactionError) throw transactionError;
        
        const monthlyRevenue = monthlyTransactions 
          ? monthlyTransactions.reduce((sum, transaction) => sum + parseFloat(String(transaction.amount || "0")), 0)
          : 0;

        // Fetch most booked service
        const { data: serviceStats, error: serviceError } = await supabase
          .from('appointments')
          .select(`
            service_id,
            services (name)
          `)
          .gte('start_time', firstDayOfMonth)
          .lte('start_time', lastDayOfMonth);
          
        if (serviceError) throw serviceError;
        
        // Count occurrences of each service
        const serviceCounts: Record<string, { count: number, name: string }> = {};
        serviceStats.forEach(stat => {
          if (stat.service_id && stat.services?.name) {
            if (!serviceCounts[stat.service_id]) {
              serviceCounts[stat.service_id] = { count: 0, name: stat.services.name };
            }
            serviceCounts[stat.service_id].count++;
          }
        });
        
        // Find service with highest count
        let mostBookedService = "";
        let highestCount = 0;
        
        Object.values(serviceCounts).forEach(service => {
          if (service.count > highestCount) {
            highestCount = service.count;
            mostBookedService = service.name;
          }
        });

        // Calculate occupancy rate (simple example - can be refined based on business needs)
        const occupancyRate = weekAppts && weekAppts.length > 0 ? 
          Math.min(Math.round((weekAppts.length / 30) * 100), 100) : 0;  // Assuming 30 appointments is 100% capacity
          
        setStats({
          todayAppointments: todayAppts?.length || 0,
          weekAppointments: weekAppts?.length || 0,
          totalClients: clientsCount || 0,
          monthlyRevenue: monthlyRevenue,
          mostBookedService: mostBookedService || "Nenhum",
          occupancyRate: occupancyRate
        });

        // Fetch upcoming appointments
        const { data: upcomingAppts, error: upcomingError } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            clients (
              id,
              name
            ),
            services (
              id,
              name
            ),
            employees (
              id, 
              name
            )
          `)
          .gt('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(5);
        
        if (upcomingError) throw upcomingError;

        // Format upcoming appointments
        const formattedAppointments = upcomingAppts.map(appointment => {
          const date = parseISO(appointment.start_time);
          let displayDate;
          
          if (isToday(date)) {
            displayDate = "Hoje";
          } else if (isTomorrow(date)) {
            displayDate = "Amanhã";
          } else {
            displayDate = format(date, "dd/MM", { locale: ptBR });
          }
          
          return {
            id: appointment.id,
            client: appointment.clients?.name || "Cliente não especificado",
            service: appointment.services?.name || "Serviço não especificado",
            employee: appointment.employees?.name || "Profissional não especificado",
            time: format(date, "HH:mm"),
            date: displayDate,
            fullDate: date
          };
        });

        setUpcomingAppointments(formattedAppointments);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Erro ao carregar dados", {
          description: "Não foi possível carregar os dados do dashboard."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus indicadores de negócio
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Agenda
            </Link>
          </Button>
          <Button className="bg-kontrola-600 hover:bg-kontrola-700" size="sm" asChild>
            <Link to="/dashboard/clients/new">
              <Users className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-kontrola-600" />
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-kontrola-600" />
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-kontrola-600" />
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthlyRevenue)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <Activity className="h-5 w-5 mr-2 text-kontrola-600" />
                <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
              </div>
              <Progress value={stats.occupancyRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Próximos Agendamentos</CardTitle>
            <CardDescription>Acompanhe os próximos atendimentos</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum agendamento próximo encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-kontrola-600" />
                        <span className="font-medium">{appointment.date} às {appointment.time}</span>
                      </div>
                      <div className="text-sm text-muted-foreground pl-6 mt-1">{appointment.client}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-medium">{appointment.service}</div>
                      <div className="text-sm text-muted-foreground">{appointment.employee}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Visão Geral</CardTitle>
            <CardDescription>Resumo do desempenho de seu negócio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-kontrola-600" />
                  <span>Agendamentos da semana</span>
                </div>
                <Badge variant="outline" className="font-medium">
                  {stats.weekAppointments}
                </Badge>
              </div>

              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center">
                  <Scissors className="h-4 w-4 mr-2 text-kontrola-600" />
                  <span>Serviço mais agendado</span>
                </div>
                <Badge variant="outline" className="font-medium">
                  {stats.mostBookedService}
                </Badge>
              </div>

              <div className="flex justify-between items-center pb-3">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-kontrola-600" />
                  <span>Média de receita por cliente</span>
                </div>
                <Badge variant="outline" className="font-medium">
                  {stats.totalClients > 0
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthlyRevenue / stats.totalClients)
                    : "R$ 0,00"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
