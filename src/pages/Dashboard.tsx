
import React from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import UpcomingAppointmentsList from "@/components/dashboard/analytics/UpcomingAppointmentsList";
import MostUsedServicesChart from "@/components/dashboard/analytics/MostUsedServicesChart";
import AverageServiceCostCard from "@/components/dashboard/analytics/AverageServiceCostCard";
import OccupationRateChart from "@/components/dashboard/analytics/OccupationRateChart";
import GrowthTrendsChart from "@/components/dashboard/analytics/GrowthTrendsChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, CalendarRange } from "lucide-react";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Estatísticas básicas existentes */}
        <DashboardOverview />
        
        {/* Novas visualizações estratégicas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UpcomingAppointmentsList />
          </div>
          <div className="lg:col-span-1">
            <AverageServiceCostCard />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MostUsedServicesChart />
          <OccupationRateChart />
        </div>

        <GrowthTrendsChart />
        
        {/* Cards de navegação rápida existentes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card data-menu="clients">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Gerenciar Clientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cadastre e gerencie todos os seus clientes. Mantenha suas informações de contato organizadas.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/dashboard/clients">Ver Clientes</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card data-menu="services">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>Gerenciar Serviços</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cadastre os serviços que você oferece, com preços, duração e outras informações.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/dashboard/services">Ver Serviços</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card data-menu="holidays">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarRange className="h-5 w-5" />
                <span>Gerenciar Feriados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure os feriados nacionais e personalizados para o bloqueio automático da agenda.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/dashboard/holidays">Ver Feriados</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
