
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import DashboardHeader from "./overview/DashboardHeader";
import StatsSummary from "./overview/StatsSummary";
import UpcomingAppointments from "./overview/UpcomingAppointments";
import TasksList from "./overview/TasksList";

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

  return (
    <div className="space-y-8">
      <DashboardHeader />
      <StatsSummary stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UpcomingAppointments appointments={upcomingAppointments} />
        <TasksList tasks={tasks} />
      </div>
    </div>
  );
};

export default DashboardOverview;
