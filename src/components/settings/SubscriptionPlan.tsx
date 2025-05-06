
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanProps {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  current?: boolean;
  popular?: boolean;
}

const Plan: React.FC<PlanProps> = ({
  name,
  price,
  description,
  features,
  current = false,
  popular = false,
}) => {
  return (
    <Card className={`flex flex-col ${popular ? "border-2 border-purple-500" : ""}`}>
      {popular && (
        <div className="bg-purple-500 text-white text-center py-1 text-xs font-medium">
          RECOMENDADO
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{name}</span>
          {current && <span className="text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded-full">Plano atual</span>}
        </CardTitle>
        <div className="mt-2">
          <span className="text-2xl font-bold">{price}</span>
          {price !== "Grátis" && <span className="text-muted-foreground">/mês</span>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check 
                className={`w-5 h-5 mr-2 ${feature.included ? "text-green-500" : "text-gray-300"}`} 
              />
              <span className={!feature.included ? "text-muted-foreground" : ""}>{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          variant={current ? "outline" : popular ? "default" : "secondary"} 
          className={`w-full ${popular ? "" : ""}`}
          disabled={current}
        >
          {current ? "Plano Atual" : "Fazer Upgrade"} 
          {!current && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </CardFooter>
    </Card>
  );
};

const SubscriptionPlan: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <CardTitle>Planos de Assinatura</CardTitle>
        </div>
        <CardDescription>
          Escolha o plano ideal para o seu negócio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Plan
            name="Básico"
            price="Grátis"
            description="Ideal para quem está começando"
            current={true}
            features={[
              { text: "Agenda online", included: true },
              { text: "Até 30 clientes", included: true },
              { text: "Até 5 serviços", included: true },
              { text: "1 funcionário", included: true },
              { text: "Acesso à agenda online", included: true },
              { text: "Sem marca personalizada", included: false },
              { text: "Relatórios financeiros", included: false },
              { text: "Suporte prioritário", included: false },
            ]}
          />
          
          <Plan
            name="Profissional"
            price="R$49,90"
            description="Para profissionais que querem crescer"
            popular={true}
            features={[
              { text: "Agenda online", included: true },
              { text: "Clientes ilimitados", included: true },
              { text: "Serviços ilimitados", included: true },
              { text: "Até 5 funcionários", included: true },
              { text: "Acesso à agenda online", included: true },
              { text: "Marca personalizada", included: true },
              { text: "Relatórios financeiros", included: true },
              { text: "Suporte prioritário", included: false },
            ]}
          />
          
          <Plan
            name="Empresarial"
            price="R$99,90"
            description="Para empresas estabelecidas"
            features={[
              { text: "Agenda online", included: true },
              { text: "Clientes ilimitados", included: true },
              { text: "Serviços ilimitados", included: true },
              { text: "Funcionários ilimitados", included: true },
              { text: "Acesso à agenda online", included: true },
              { text: "Marca personalizada", included: true },
              { text: "Relatórios financeiros avançados", included: true },
              { text: "Suporte prioritário", included: true },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPlan;
