
import React from "react";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Clock, 
  Smartphone, 
  Shield,
  BarChart3,
  Settings,
  Bell,
  MapPin,
  Star,
  Zap
} from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="kontrola-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tudo que você precisa para gerenciar seu negócio
          </h2>
          <p className="text-lg text-gray-600">
            Uma solução completa e intuitiva que cresce junto com seu negócio.
            Descomplicamos a gestão para você focar no que realmente importa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={Calendar}
            title="Agenda Inteligente"
            description="Gerencie todos os agendamentos com agenda online, notificações automáticas e sincronização em tempo real."
            features={["Agenda online 24/7", "Notificações automáticas", "Bloqueio de horários"]}
          />
          
          <FeatureCard
            icon={Users}
            title="Gestão de Clientes"
            description="Mantenha o histórico completo de cada cliente, preferências e dados de contato organizados."
            features={["Histórico completo", "Dados de contato", "Preferências personalizadas"]}
          />
          
          <FeatureCard
            icon={CreditCard}
            title="Controle Financeiro"
            description="Acompanhe receitas, despesas e tenha relatórios detalhados da saúde financeira do seu negócio."
            features={["Controle de receitas", "Gestão de despesas", "Relatórios detalhados"]}
          />
          
          <FeatureCard
            icon={Settings}
            title="Gestão de Funcionários"
            description="Organize escalas de trabalho, defina permissões e acompanhe a produtividade da equipe."
            features={["Escalas de trabalho", "Controle de permissões", "Relatórios de produtividade"]}
          />
          
          <FeatureCard
            icon={BarChart3}
            title="Relatórios e Análises"
            description="Tenha insights valiosos sobre seu negócio com relatórios detalhados e métricas importantes."
            features={["Dashboard completo", "Métricas de performance", "Análise de tendências"]}
          />
          
          <FeatureCard
            icon={Smartphone}
            title="Acesso Mobile"
            description="Gerencie seu negócio de qualquer lugar com nossa interface responsiva e otimizada."
            features={["Interface responsiva", "Acesso em qualquer dispositivo", "Sincronização automática"]}
          />
        </div>

        {/* Seção de diferenciais */}
        <div className="bg-gradient-to-r from-kontrola-50 to-kontrola-100 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Por que escolher o KontrolaApp?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Desenvolvido especialmente para profissionais brasileiros que buscam praticidade e eficiência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <DifferentialCard
              icon={Zap}
              title="Rápido e Fácil"
              description="Configure em minutos e comece a usar imediatamente"
            />
            
            <DifferentialCard
              icon={Shield}
              title="Seguro e Confiável"
              description="Seus dados protegidos com a mais alta segurança"
            />
            
            <DifferentialCard
              icon={Star}
              title="Suporte Nacional"
              description="Atendimento em português quando você precisar"
            />
            
            <DifferentialCard
              icon={MapPin}
              title="Feito no Brasil"
              description="Desenvolvido pensando na realidade brasileira"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, features }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-kontrola-100 rounded-lg p-3">
          <Icon className="h-6 w-6 text-kontrola-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-1.5 h-1.5 bg-kontrola-600 rounded-full" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface DifferentialCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const DifferentialCard: React.FC<DifferentialCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="text-center">
      <div className="bg-white rounded-xl p-4 inline-flex items-center justify-center mb-4 shadow-sm">
        <Icon className="h-8 w-8 text-kontrola-600" />
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default FeaturesSection;
