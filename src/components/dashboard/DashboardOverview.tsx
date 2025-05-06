import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Separator } from "@/components/ui/separator";

const DashboardOverview: React.FC = () => {
  const {
    clientsCount,
    appointmentsCount,
    servicesCount,
    isLoading,
    error,
  } = useDashboardData();

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p>Erro ao carregar os dados.</p>;
  }

  const stats = [
    {
      name: "Clientes",
      value: clientsCount ? clientsCount.toString() : "0"
    },
    {
      name: "Agendamentos",
      value: appointmentsCount ? appointmentsCount.toString() : "0"
    },
    {
      name: "Serviços",
      value: servicesCount ? servicesCount.toString() : "0"
    },
  ];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Visão Geral</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {stat.name}
            </p>
            <p className="text-2xl font-semibold">{stat.value}</p>
            {index < stats.length - 1 && (
              <Separator className="md:hidden" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DashboardOverview;
