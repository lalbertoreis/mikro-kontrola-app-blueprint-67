
import React from "react";
import { CheckIcon, Star, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ModernPricingSection = () => {
  const plans = [
    {
      name: "Básico",
      price: "0",
      description: "Para profissionais que estão começando",
      icon: Star,
      features: [
        "Agenda ilimitada",
        "Até 50 clientes",
        "Link de agendamento público",
        "Até 3 serviços",
        "Acesso web e mobile"
      ],
      limitations: [
        "Sem notificações WhatsApp",
        "Sem controle financeiro avançado"
      ],
      buttonText: "Começar Grátis",
      buttonVariant: "outline" as const,
      popular: false,
      highlight: "Grátis para sempre"
    },
    {
      name: "Profissional",
      price: "39,90",
      description: "Para profissionais que querem crescer",
      icon: Crown,
      features: [
        "Tudo do plano Básico",
        "Clientes ilimitados",
        "Serviços ilimitados",
        "Notificações WhatsApp",
        "Controle financeiro completo",
        "Relatórios detalhados",
        "Suporte prioritário"
      ],
      limitations: [],
      buttonText: "Assinar Agora",
      buttonVariant: "default" as const,
      popular: true,
      highlight: "Mais escolhido"
    },
    {
      name: "Empresarial",
      price: "99,90",
      description: "Para pequenas empresas",
      icon: Zap,
      features: [
        "Tudo do plano Profissional",
        "Até 5 funcionários",
        "Controle de permissões",
        "Relatórios avançados",
        "Integração com pagamentos",
        "API personalizada",
        "Suporte dedicado"
      ],
      limitations: [],
      buttonText: "Assinar Agora",
      buttonVariant: "outline" as const,
      popular: false,
      highlight: "Para equipes"
    }
  ];

  return (
    <section className="py-20 bg-white" id="pricing">
      <div className="kontrola-container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-sm font-medium text-green-700 border border-green-200 mb-6">
            💰 Preços Transparentes
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Planos que crescem
            <span className="block text-kontrola-600">junto com seu negócio</span>
          </h2>
          <p className="text-xl text-gray-600">
            Sem surpresas, sem taxas ocultas. Cancele a qualquer momento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4">
          {plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Garantia de 7 dias</h3>
            <p className="text-gray-600 mb-6">
              Experimente todos os recursos sem compromisso. Se não gostar, devolvemos 100% do seu dinheiro.
            </p>
            <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-600">
              <span className="flex items-center">✅ Sem fidelidade</span>
              <span className="flex items-center">✅ Cancele quando quiser</span>
              <span className="flex items-center">✅ Migração gratuita</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface PlanCardProps {
  plan: {
    name: string;
    price: string;
    description: string;
    icon: React.ElementType;
    features: string[];
    limitations: string[];
    buttonText: string;
    buttonVariant: "default" | "outline";
    popular: boolean;
    highlight: string;
  };
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const {
    name,
    price,
    description,
    icon: Icon,
    features,
    limitations,
    buttonText,
    buttonVariant,
    popular,
    highlight
  } = plan;

  return (
    <div className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
      popular 
        ? 'border-kontrola-600 shadow-xl bg-white' 
        : 'border-gray-200 shadow-sm bg-white hover:shadow-lg'
    }`}>
      {popular && (
        <div className="bg-gradient-to-r from-kontrola-600 to-kontrola-700 text-white text-center py-2 text-sm font-medium">
          {highlight}
        </div>
      )}
      
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
            popular ? 'bg-kontrola-100' : 'bg-gray-100'
          }`}>
            <Icon className={`w-8 h-8 ${popular ? 'text-kontrola-600' : 'text-gray-600'}`} />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
          
          {!popular && (
            <div className="text-sm text-gray-500 font-medium mt-2 bg-gray-100 px-3 py-1 rounded-full inline-block">
              {highlight}
            </div>
          )}
          
          <div className="mt-6 flex items-center justify-center">
            <span className="text-5xl font-bold text-gray-900">R$ {price}</span>
            <span className="ml-2 text-xl font-medium text-gray-500">/mês</span>
          </div>
          
          <p className="mt-2 text-gray-600">{description}</p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <CheckIcon className="h-5 w-5 text-green-500" />
              </div>
              <p className="ml-3 text-gray-700">{feature}</p>
            </li>
          ))}
          
          {limitations.map((limitation, idx) => (
            <li key={idx} className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="ml-3 text-gray-400">{limitation}</p>
            </li>
          ))}
        </ul>

        {/* Button */}
        <Link to="/register" className="block">
          <Button 
            variant={buttonVariant} 
            className={`w-full h-12 text-base ${
              popular 
                ? 'bg-kontrola-600 hover:bg-kontrola-700 text-white' 
                : ''
            }`}
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ModernPricingSection;
