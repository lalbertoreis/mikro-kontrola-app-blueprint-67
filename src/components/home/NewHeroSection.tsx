
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CreditCard, CheckCircle, ArrowRight, Star } from "lucide-react";

const NewHeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-kontrola-50 via-background to-kontrola-100 dark:from-kontrola-900 dark:via-background dark:to-kontrola-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 md:w-72 md:h-72 bg-kontrola-300 dark:bg-kontrola-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-32 h-32 md:w-72 md:h-72 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-32 h-32 md:w-72 md:h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="kontrola-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-screen py-12 lg:py-20">
          {/* Conteúdo Principal */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 bg-kontrola-100 dark:bg-kontrola-800 rounded-full text-xs md:text-sm font-medium text-kontrola-700 dark:text-kontrola-300 border border-kontrola-200 dark:border-kontrola-700">
              <Star className="w-3 h-3 md:w-4 md:h-4 mr-2 fill-current" />
              Mais de 1.000 profissionais confiam no KontrolaApp
            </div>

            {/* Título Principal */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Transforme seu
                <span className="block text-kontrola-600 dark:text-kontrola-400">negócio</span>
                <span className="block">em minutos</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                A plataforma completa para gerenciar agenda, clientes e pagamentos. 
                Desenvolvida especialmente para profissionais que querem crescer.
              </p>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center lg:justify-start">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                <span className="text-sm md:text-base text-foreground font-medium">Grátis para começar</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                <span className="text-sm md:text-base text-foreground font-medium">Sem complicações</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                <span className="text-sm md:text-base text-foreground font-medium">Suporte em português</span>
              </div>
            </div>

            {/* Call to Action */}
            <div className="flex justify-center lg:justify-start pt-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-kontrola-600 hover:bg-kontrola-700 dark:bg-kontrola-500 dark:hover:bg-kontrola-600 text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto">
                  Comece Gratuitamente
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="pt-6 lg:pt-8">
              <p className="text-sm text-muted-foreground mb-4">Usado por profissionais de:</p>
              <div className="flex flex-wrap gap-2 md:gap-4 justify-center lg:justify-start text-xs md:text-sm">
                <span className="bg-card border border-border px-2 md:px-3 py-1 rounded-full text-card-foreground">Salões de Beleza</span>
                <span className="bg-card border border-border px-2 md:px-3 py-1 rounded-full text-card-foreground">Clínicas</span>
                <span className="bg-card border border-border px-2 md:px-3 py-1 rounded-full text-card-foreground">Consultórios</span>
                <span className="bg-card border border-border px-2 md:px-3 py-1 rounded-full text-card-foreground">Estética</span>
                <span className="bg-card border border-border px-2 md:px-3 py-1 rounded-full text-card-foreground">Fisioterapia</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-lg lg:max-w-2xl">
              {/* Browser Frame */}
              <div className="bg-card border border-border rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                {/* Browser Header */}
                <div className="bg-muted px-3 md:px-4 py-2 md:py-3 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-red-400 rounded-full"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-4 md:p-6 bg-gradient-to-br from-muted/50 to-background">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-foreground">Dashboard</h3>
                      <p className="text-sm md:text-base text-muted-foreground">Bem-vindo de volta!</p>
                    </div>
                    <div className="bg-kontrola-600 dark:bg-kontrola-500 text-white font-bold text-xs md:text-sm p-1.5 md:p-2 rounded">K</div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                    <div className="bg-card border border-border p-2 md:p-4 rounded-lg shadow-sm">
                      <div className="text-lg md:text-2xl font-bold text-foreground">28</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Agendamentos</div>
                    </div>
                    <div className="bg-card border border-border p-2 md:p-4 rounded-lg shadow-sm">
                      <div className="text-lg md:text-2xl font-bold text-green-600">R$ 2.840</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Receita</div>
                    </div>
                    <div className="bg-card border border-border p-2 md:p-4 rounded-lg shadow-sm">
                      <div className="text-lg md:text-2xl font-bold text-blue-600">156</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Clientes</div>
                    </div>
                  </div>

                  {/* Features Preview */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="bg-card border border-border p-3 md:p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-6 h-6 md:w-8 md:h-8 text-kontrola-600 dark:text-kontrola-400" />
                        <div>
                          <div className="text-sm md:text-base font-semibold text-foreground">Próximo Agendamento</div>
                          <div className="text-xs md:text-sm text-muted-foreground">Maria Silva - 14:00</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                      <div className="bg-card border border-border p-2 md:p-4 rounded-lg shadow-sm text-center">
                        <Users className="w-4 h-4 md:w-6 md:h-6 text-kontrola-600 dark:text-kontrola-400 mx-auto mb-1 md:mb-2" />
                        <div className="text-xs md:text-sm font-medium text-foreground">Clientes</div>
                      </div>
                      <div className="bg-card border border-border p-2 md:p-4 rounded-lg shadow-sm text-center">
                        <CreditCard className="w-4 h-4 md:w-6 md:h-6 text-kontrola-600 dark:text-kontrola-400 mx-auto mb-1 md:mb-2" />
                        <div className="text-xs md:text-sm font-medium text-foreground">Pagamentos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-green-500 text-white p-2 md:p-3 rounded-full shadow-lg animate-bounce">
                <CheckCircle className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 bg-blue-500 text-white p-2 md:p-3 rounded-full shadow-lg animate-pulse">
                <Calendar className="w-4 h-4 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHeroSection;
