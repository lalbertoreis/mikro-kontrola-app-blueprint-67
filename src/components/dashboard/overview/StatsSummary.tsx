
import React from "react";
import { Calendar, Users, CreditCard, Bell } from "lucide-react";
import StatsCard from "./StatsCard";
import { formatCurrency } from "@/lib/utils";

interface StatsSummaryProps {
  stats: {
    todayAppointments: number;
    clients: number;
    monthlyRevenue: number;
    notificationsSent: number;
  };
}

const StatsSummary = ({ stats }: StatsSummaryProps) => {
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
      value: formatCurrency(stats.monthlyRevenue),
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          link={stat.link}
        />
      ))}
    </div>
  );
};

export default StatsSummary;
