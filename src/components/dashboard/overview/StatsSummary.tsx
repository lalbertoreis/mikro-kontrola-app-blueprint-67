
import React from "react";
import { Calendar, Users, CreditCard, Bell } from "lucide-react";
import StatsCard from "./StatsCard";
import { formatCurrency } from "@/lib/utils";

interface StatsSummaryProps {
  stats: {
    todayAppointments: string;
    clients: string;
    monthlyRevenue: string;
    notificationsSent: string;
  };
}

const StatsSummary = ({ stats }: StatsSummaryProps) => {
  // Format the revenue correctly by parsing the string to a number first
  const formattedRevenue = formatCurrency(parseFloat(stats.monthlyRevenue || "0"));

  // Stats info with real data
  const statCards = [
    {
      title: "Agendamentos Hoje",
      value: stats.todayAppointments,
      change: "+1 desde ontem",
      icon: Calendar,
      link: "/dashboard/calendar"
    },
    {
      title: "Clientes Ativos",
      value: stats.clients,
      change: "+5 este mês",
      icon: Users,
      link: "/dashboard/clients"
    },
    {
      title: "Receita do Mês",
      value: formattedRevenue,
      change: "+15% comparado ao mês anterior",
      icon: CreditCard,
      link: "/dashboard/finance"
    },
    {
      title: "Notificações Enviadas",
      value: stats.notificationsSent,
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
