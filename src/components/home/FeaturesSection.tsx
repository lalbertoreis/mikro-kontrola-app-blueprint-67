
import React from "react";
import { Calendar, Link, Bell, CreditCard, Users, Settings } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Gerencie seus compromissos com facilidade. Visualize sua agenda diária, semanal ou mensal e evite conflitos de horários."
    },
    {
      icon: Link,
      title: "Link Público para Agendamento",
      description: "Compartilhe um link para seus clientes agendarem serviços diretamente, sem complicações ou aplicativos adicionais."
    },
    {
      icon: Bell,
      title: "Notificações por WhatsApp",
      description: "Envie lembretes automáticos de agendamentos para reduzir faltas e manter seus clientes informados."
    },
    {
      icon: CreditCard,
      title: "Controle Financeiro",
      description: "Calcule preços com base nos seus custos e monitore seu ponto de equilíbrio para tomar decisões mais inteligentes."
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Mantenha um cadastro completo dos seus clientes com histórico de serviços, preferências e informações de contato."
    },
    {
      icon: Settings,
      title: "Totalmente Personalizável",
      description: "Adapte o sistema às necessidades do seu negócio, configurando serviços, preços e políticas de atendimento."
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="kontrola-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Recursos que facilitam seu dia a dia</h2>
          <p className="text-lg text-gray-600">
            Desenvolvido especialmente para as necessidades de pequenos negócios e profissionais autônomos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
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
  };
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const { icon: Icon, title, description } = feature;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <div className="h-12 w-12 bg-kontrola-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-kontrola-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeaturesSection;
