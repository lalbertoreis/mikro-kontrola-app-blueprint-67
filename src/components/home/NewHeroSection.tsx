
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CreditCard, CheckCircle, ArrowRight, Star } from "lucide-react";

const NewHeroSection = () => {
  return (
    <div className="relative min-h-[90vh] bg-gradient-to-br from-kontrola-50 via-white to-kontrola-100 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-kontrola-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="kontrola-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[90vh] py-12">
          {/* Conteúdo Principal */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-kontrola-100 rounded-full text-sm font-medium text-kontrola-700 border border-kontrola-200">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Mais de 1.000 profissionais confiam no KontrolaApp
            </div>

            {/* Título Principal */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transforme seu
                <span className="block text-kontrola-600">negócio</span>
                <span className="block">em minutos</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                A plataforma completa para gerenciar agenda, clientes e pagamentos. 
                Desenvolvida especialmente para profissionais que querem crescer.
              </p>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 font-medium">Grátis para começar</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 font-medium">Sem complicações</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 font-medium">Suporte em português</span>
              </div>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4 justify-center lg:justify-start">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-kontrola-600 hover:bg-kontrola-700 text-lg px-8 py-4 h-auto">
                  Comece Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="#demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-4 h-auto">
                  Ver Demonstração
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="pt-8">
              <p className="text-sm text-gray-500 mb-4">Usado por profissionais de:</p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-gray-600">
                <span className="bg-white px-3 py-1 rounded-full border">Salões de Beleza</span>
                <span className="bg-white px-3 py-1 rounded-full border">Clínicas</span>
                <span className="bg-white px-3 py-1 rounded-full border">Consultórios</span>
                <span className="bg-white px-3 py-1 rounded-full border">Estética</span>
                <span className="bg-white px-3 py-1 rounded-full border">Fisioterapia</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="lg:flex lg:justify-end">
            <div className="relative">
              {/* Browser Frame */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-2xl w-full transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Browser Header */}
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Dashboard</h3>
                      <p className="text-gray-600">Bem-vindo de volta!</p>
                    </div>
                    <div className="bg-kontrola-600 text-white font-bold text-sm p-2 rounded">K</div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="text-2xl font-bold text-gray-900">28</div>
                      <div className="text-sm text-gray-600">Agendamentos</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="text-2xl font-bold text-green-600">R$ 2.840</div>
                      <div className="text-sm text-gray-600">Receita</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">156</div>
                      <div className="text-sm text-gray-600">Clientes</div>
                    </div>
                  </div>

                  {/* Features Preview */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-8 h-8 text-kontrola-600" />
                        <div>
                          <div className="font-semibold text-gray-900">Próximo Agendamento</div>
                          <div className="text-sm text-gray-600">Maria Silva - 14:00</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
                        <Users className="w-6 h-6 text-kontrola-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Clientes</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
                        <CreditCard className="w-6 h-6 text-kontrola-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Pagamentos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg animate-bounce">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg animate-pulse">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHeroSection;
