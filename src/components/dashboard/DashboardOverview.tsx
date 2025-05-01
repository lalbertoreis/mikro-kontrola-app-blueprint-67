
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, CreditCard, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DashboardOverview = () => {
  // Mock data - in a real app this would come from an API
  const stats = [
    {
      title: "Agendamentos Hoje",
      value: "3",
      change: "+1 desde ontem",
      icon: Calendar,
      link: "/dashboard/calendar"
    },
    {
      title: "Clientes Ativos",
      value: "28",
      change: "+5 este mês",
      icon: Users,
      link: "/dashboard/clients"
    },
    {
      title: "Receita do Mês",
      value: "R$ 2.450",
      change: "+15% comparado ao mês anterior",
      icon: CreditCard,
      link: "/dashboard/finance"
    },
    {
      title: "Notificações Enviadas",
      value: "42",
      change: "12 agendamentos confirmados",
      icon: Bell,
      link: "/dashboard/notifications"
    }
  ];

  const upcomingAppointments = [
    { client: "Maria Silva", service: "Consulta Inicial", time: "14:00", date: "Hoje" },
    { client: "João Costa", service: "Avaliação", time: "10:30", date: "Amanhã" },
    { client: "Pedro Santos", service: "Sessão de Acompanhamento", time: "16:00", date: "25/05" }
  ];

  const tasks = [
    { title: "Confirmar agendamento com Maria", completed: false },
    { title: "Preparar material para João", completed: true },
    { title: "Enviar orçamento para novo cliente", completed: false }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Olá, Usuário</h1>
        <p className="text-gray-500">Bem-vindo ao seu painel de controle. Aqui está o resumo do seu dia.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
