
import React from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const plans = [
    {
      name: "Básico",
      price: "0",
      description: "Para profissionais autônomos que estão começando",
      features: [
        "Agenda ilimitada",
        "Cadastro de até 50 clientes",
        "Link público para agendamento",
        "Até 3 serviços cadastrados",
        "Acesso pelo celular ou computador"
      ],
      limitations: [
        "Sem notificações por WhatsApp",
        "Sem controle financeiro avançado"
      ],
      buttonText: "Começar Grátis",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Profissional",
      price: "39,90",
      description: "Para profissionais que querem crescer",
      features: [
        "Agenda ilimitada",
        "Clientes ilimitados",
        "Link público para agendamento",
        "Serviços ilimitados",
        "Notificações por WhatsApp",
        "Controle financeiro completo",
        "Relatórios básicos"
      ],
      limitations: [],
      buttonText: "Assinar Agora",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Empresarial",
      price: "99,90",
      description: "Para pequenas empresas com equipe",
      features: [
        "Todas as funções do Profissional",
        "Até 5 usuários/funcionários",
        "Controle de permissões",
        "Relatórios avançados",
        "Integração com sistemas de pagamento",
        "Suporte prioritário"
      ],
      limitations: [],
      buttonText: "Assinar Agora",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <section className="py-16 bg-white" id="pricing">
      <div className="kontrola-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Planos simples e acessíveis</h2>
          <p className="text-lg text-gray-600">
            Escolha o plano ideal para o seu negócio, sem surpresas ou taxas ocultas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Todos os planos incluem 7 dias de teste grátis. Cancele a qualquer momento.
          </p>
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
    features: string[];
    limitations: string[];
    buttonText: string;
    buttonVariant: "default" | "outline";
    popular: boolean;
  };
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const {
    name,
    price,
    description,
    features,
    limitations,
    buttonText,
    buttonVariant,
    popular
  } = plan;

  return (
    <div className={`relative rounded-lg border ${popular ? 'border-kontrola-600 shadow-lg' : 'border-gray-200 shadow-sm'} overflow-hidden`}>
      {popular && (
        <div className="bg-kontrola-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg absolute top-0 right-0">
          Mais Popular
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-bold text-gray-900">R$ {price}</span>
          <span className="ml-1 text-xl font-medium text-gray-500">/mês</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
        
        <ul className="mt-6 space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <div className="flex-shrink-0">
                <CheckIcon className="h-5 w-5 text-green-500" />
              </div>
              <p className="ml-2 text-sm text-gray-600">{feature}</p>
            </li>
          ))}
          
          {limitations.map((limitation, idx) => (
            <li key={idx} className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="ml-2 text-sm text-gray-400">{limitation}</p>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <Link to="/register">
          <Button 
            variant={buttonVariant} 
            className={`w-full ${popular ? 'bg-kontrola-600 hover:bg-kontrola-700' : ''}`}
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PricingSection;
