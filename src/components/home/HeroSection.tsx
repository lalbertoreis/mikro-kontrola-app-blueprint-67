
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Clock, 
  Smartphone, 
  Shield,
  BarChart3,
  CheckCircle
} from "lucide-react";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-b from-white via-kontrola-50/30 to-gray-50 py-16 md:py-24">
      <div className="kontrola-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                A solução <span className="text-kontrola-600">completa</span> para seu negócio
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Sistema completo de gestão para salões de beleza, clínicas, consultórios e profissionais autônomos. 
                Controle agenda, clientes, funcionários e finanças em um só lugar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-kontrola-600 hover:bg-kontrola-700">
                  Comece Gratuitamente
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver Demonstração
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <FeatureBadge icon={CheckCircle} text="Sem complicações" />
              <FeatureBadge icon={Shield} text="Dados seguros" />
              <FeatureBadge icon={Smartphone} text="Acesso mobile" />
              <FeatureBadge icon={Clock} text="Suporte 24/7" />
            </div>
          </div>

          <div className="lg:flex lg:justify-end">
            <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden max-w-md w-full">
              {/* Header do Dashboard */}
              <div className="bg-gradient-to-r from-kontrola-600 to-kontrola-700 p-6 text-white">
                <h3 className="text-xl font-semibold">Dashboard KontrolaApp</h3>
                <p className="text-kontrola-100 text-sm">Visão geral do seu negócio</p>
              </div>

              <div className="p-6">
                {/* Funcionalidades principais */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <FeatureCard icon={Calendar} title="Agenda" subtitle="Online" />
                  <FeatureCard icon={Users} title="Clientes" subtitle="Gestão" />
                  <FeatureCard icon={CreditCard} title="Finanças" subtitle="Controle" />
                </div>

                {/* Estatísticas em tempo real */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-green-700">Agendamentos Hoje</p>
                      <p className="text-2xl font-bold text-green-800">12</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-blue-700">Receita do Mês</p>
                      <p className="text-2xl font-bold text-blue-800">R$ 8.450</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                {/* Próximos agendamentos */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Próximos agendamentos</h4>
                  <div className="space-y-2">
                    <AppointmentItem 
                      name="Maria Silva" 
                      time="14:00" 
                      service="Corte + Escova"
                      status="confirmed" 
                    />
                    <AppointmentItem 
                      name="João Costa" 
                      time="15:30" 
                      service="Barba + Bigode"
                      status="pending" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-kontrola-50 p-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ver relatórios completos</span>
                  <span className="text-sm font-medium text-kontrola-700 cursor-pointer hover:text-kontrola-800">
                    Acessar →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureBadgeProps {
  icon: React.ElementType;
  text: string;
}

const FeatureBadge: React.FC<FeatureBadgeProps> = ({ icon: Icon, text }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="rounded-full bg-green-100 p-1.5">
        <Icon className="w-4 h-4 text-green-600" />
      </div>
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3 text-center">
      <Icon className="h-6 w-6 text-kontrola-600 mb-1" />
      <span className="text-xs font-medium text-gray-700">{title}</span>
      <span className="text-xs text-gray-500">{subtitle}</span>
    </div>
  );
};

interface AppointmentItemProps {
  name: string;
  time: string;
  service: string;
  status: 'confirmed' | 'pending';
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ name, time, service, status }) => {
  return (
    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
      <div className="bg-kontrola-100 text-kontrola-700 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
        {name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">{service}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-800">{time}</p>
        <div className={`w-2 h-2 rounded-full ${
          status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
        }`} />
      </div>
    </div>
  );
};

export default HeroSection;
