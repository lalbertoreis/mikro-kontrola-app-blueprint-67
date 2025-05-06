import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, CreditCard, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    clients: 0,
    monthlyRevenue: 0,
    notificationsSent: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [tasks, setTasks] = useState([
    { title: "Confirmar agendamento com Maria", completed: false },
    { title: "Preparar material para João", completed: true },
    { title: "Enviar orçamento para novo cliente", completed: false }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch today's appointments
        const today = new Date().toISOString().split('T')[0];
        const { data: todayAppts, error: todayApptError } = await supabase
          .from('appointments')
          .select('*')
          .gte('start_time', `${today}T00:00:00`)
          .lte('start_time', `${today}T23:59:59`);
        
        if (todayApptError) throw todayApptError;

        // Fetch clients count
        const { count: clientsCount, error: clientsError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });
        
        if (clientsError) throw clientsError;

        // Fetch monthly revenue
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const { data: monthlyTransactions, error: transactionError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'income')
          .gte('date', firstDayOfMonth)
          .lte('date', lastDayOfMonth);
        
        if (transactionError) throw transactionError;
        
        const monthlyRevenue = monthlyTransactions 
          ? monthlyTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0)
          : 0;

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
            )
          `)
          .gt('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(3);
        
        if (upcomingError) throw upcomingError;

        // Update stats
        setStats({
          todayAppointments: todayAppts?.length || 0,
          clients: clientsCount || 0,
          monthlyRevenue: monthlyRevenue,
          notificationsSent: 42, // Mock data for now
        });

        // Format upcoming appointments
        const formattedAppointments = upcomingAppts.map(appointment => {
          const date = new Date(appointment.start_time);
          let displayDate;
          
          if (isToday(date)) {
            displayDate = "Hoje";
          } else if (isTomorrow(date)) {
            displayDate = "Amanhã";
          } else {
            displayDate = format(date, "dd/MM", { locale: ptBR });
          }
          
          return {
            client: appointment.clients?.name || "Cliente não especificado",
            service: appointment.services?.name || "Serviço não especificado",
            time: format(date, "HH:mm"),
            date: displayDate
          };
        });

        setUpcomingAppointments(formattedAppointments);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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

  // Stats info with real data
  const statCards = [
    {
      title: "Agendamentos Hoje",
      value: stats.todayAppointments.toString(),
      change: "+1 desde ontem",
      icon: Calendar,
      link: "/dashboard/calendar"
    },
    {
      title: "Clientes Ativos",
      value: stats.clients.toString(),
      change: "+5 este mês",
      icon: Users,
      link: "/dashboard/clients"
    },
    {
      title: "Receita do Mês",
      value: `R$ ${stats.monthlyRevenue.toFixed(2)}`,
      change: "+15% comparado ao mês anterior",
      icon: CreditCard,
      link: "/dashboard/finance"
    },
    {
      title: "Notificações Enviadas",
      value: stats.notificationsSent.toString(),
      change: "12 agendamentos confirmados",
      icon: Bell,
      link: "/dashboard/notifications"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Olá, Usuário</h1>
        <p className="text-gray-500">Bem-vindo ao seu painel de controle. Aqui está o resumo do seu dia.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link to={stat.link} key={index}>
              <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>Seus compromissos para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <div className="bg-kontrola-100 text-kontrola-700 h-10 w-10 rounded-full flex items-center justify-center">
                        {appointment.client.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{appointment.client}</p>
                        <p className="text-sm text-gray-500">{appointment.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.time}</p>
                      <p className="text-sm text-gray-500">{appointment.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum agendamento próximo</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/dashboard/calendar" className="w-full">
              <Button variant="outline" className="w-full">Ver Agenda Completa</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas</CardTitle>
            <CardDescription>Suas tarefas pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center 
                    ${task.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300'}`}
                  >
                    {task.completed && (
                      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-kontrola-600 hover:bg-kontrola-700">Adicionar Tarefa</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
