
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-16 bg-kontrola-600">
      <div className="kontrola-container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para simplificar a gestão do seu negócio?
          </h2>
          <p className="text-lg text-kontrola-100 mb-8">
            Comece agora mesmo com o plano gratuito ou experimente todos os recursos por 7 dias.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Começar Grátis
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-kontrola-700">
                Solicitar Demonstração
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
