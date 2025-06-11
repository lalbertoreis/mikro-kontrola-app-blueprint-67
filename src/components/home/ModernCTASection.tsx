
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, TrendingUp } from "lucide-react";

const ModernCTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-kontrola-600 via-kontrola-700 to-kontrola-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="kontrola-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para transformar
              <span className="block">seu negócio?</span>
            </h2>
            <p className="text-xl text-kontrola-100 mb-8 max-w-2xl mx-auto">
              Junte-se a mais de 1.000 profissionais que já descobriram como é fácil 
              gerenciar agenda, clientes e pagamentos em um só lugar.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Clock className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Configuração em 5 min</h3>
              <p className="text-kontrola-100 text-sm">Comece a usar imediatamente</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <CheckCircle className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Grátis para começar</h3>
              <p className="text-kontrola-100 text-sm">Sem cartão de crédito</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <TrendingUp className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Resultados imediatos</h3>
              <p className="text-kontrola-100 text-sm">Veja a diferença no primeiro dia</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-white text-kontrola-700 hover:bg-gray-100 text-lg px-8 py-4 h-auto font-semibold"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="#demo">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-kontrola-700 text-lg px-8 py-4 h-auto font-semibold"
              >
                Ver Demonstração
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-kontrola-100 mb-4">Confiado por profissionais de todo o Brasil</p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-kontrola-200">
              <span>✨ 4.9/5 estrelas</span>
              <span>🚀 1000+ usuários</span>
              <span>📱 Disponível 24/7</span>
              <span>🇧🇷 Suporte em português</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernCTASection;
