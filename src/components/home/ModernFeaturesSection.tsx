
import React from "react";
import { 
  Calendar, 
  Link, 
  Bell, 
  CreditCard, 
  Users, 
  Settings,
  Clock,
  TrendingUp,
  Shield,
  Smartphone,
  BarChart3,
  Zap
} from "lucide-react";

const ModernFeaturesSection = () => {
  const primaryFeatures = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Sistema completo de agendamento com controle de horários, intervalos e disponibilidade. Evite conflitos e maximize sua produtividade.",
      color: "bg-blue-500",
      features: ["Agenda semanal e mensal", "Bloqueio de horários", "Controle de feriados"]
    },
    {
      icon: Link,
      title: "Agendamento Online",
      description: "Link personalizado para seus clientes agendarem 24/7. Reduza ligações e automatize o processo de marcação.",
      color: "bg-green-500",
      features: ["Link personalizado", "Disponibilidade em tempo real", "Confirmação automática"]
    },
    {
      icon: Bell,
      title: "Notificações WhatsApp",
      description: "Reduza faltas em até 70% com lembretes automáticos. Seus clientes recebem confirmações e lembretes via WhatsApp.",
      color: "bg-purple-500",
      features: ["Lembretes automáticos", "Confirmações de agendamento", "Redução de faltas"]
    },
    {
      icon: CreditCard,
      title: "Controle Financeiro",
      description: "Gerencie pagamentos, calcule custos e monitore seu ponto de equilíbrio. Precifique seus serviços de forma inteligente.",
      color: "bg-orange-500",
      features: ["Gestão de pagamentos", "Cálculo de custos", "Relatórios financeiros"]
    },
  ];

  const secondaryFeatures = [
    { icon: Users, title: "Gestão de Clientes", description: "Cadastro completo com histórico de serviços" },
    { icon: Clock, title: "Economia de Tempo", description: "Automatize tarefas repetitivas" },
    { icon: TrendingUp, title: "Aumente sua Receita", description: "Otimize horários e reduza faltas" },
    { icon: Shield, title: "Dados Seguros", description: "Informações protegidas na nuvem" },
    { icon: Smartphone, title: "Acesso Mobile", description: "Use no celular ou computador" },
    { icon: BarChart3, title: "Relatórios", description: "Acompanhe o crescimento do negócio" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="kontrola-container">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-kontrola-100 rounded-full text-sm font-medium text-kontrola-700 border border-kontrola-200 mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Funcionalidades Poderosas
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Tudo que você precisa para
            <span className="block text-kontrola-600">fazer seu negócio crescer</span>
          </h2>
          <p className="text-xl text-gray-600">
            Desenvolvido especialmente para as necessidades de pequenos negócios e profissionais autônomos.
          </p>
        </div>

        {/* Primary Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {primaryFeatures.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* Secondary Features */}
        <div className="bg-gray-50 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">E muito mais...</h3>
            <p className="text-lg text-gray-600">Recursos adicionais que fazem a diferença</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {secondaryFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-kontrola-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-kontrola-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  feature: {
    icon: React.ElementType;
    title: string;
    description: string;
    color: string;
    features: string[];
  };
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const { icon: Icon, title, description, color, features } = feature;
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-6`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      
      <ul className="space-y-2">
        {features.map((item, idx) => (
          <li key={idx} className="flex items-center text-sm text-gray-700">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModernFeaturesSection;
