
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CreditCard } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
      <div className="kontrola-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Gerencie seu negócio de forma <span className="text-kontrola-600">simples e eficiente</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Controle agenda, clientes e serviços em um só lugar. 
              A ferramenta completa para microempreendedores e profissionais autônomos.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-kontrola-600 hover:bg-kontrola-700">
                  Comece Gratuitamente
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Conhecer Recursos
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-green-100 p-1.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-gray-600">Sem complicações</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-green-100 p-1.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-gray-600">Plano gratuito</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-green-100 p-1.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-gray-600">Suporte em português</span>
              </div>
            </div>
          </div>
          <div className="lg:flex lg:justify-end">
            <div className="bg-white shadow-2xl rounded-lg border border-gray-100 overflow-hidden max-w-md w-full">
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Feature icon={Calendar} title="Agenda" />
                  <Feature icon={Users} title="Clientes" />
                  <Feature icon={CreditCard} title="Serviços" />
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">Próximos agendamentos</h3>
                    <div className="bg-gray-50 rounded-md p-4 space-y-4">
                      <AppointmentItem name="Maria Silva" time="14:00" date="Hoje" service="Consulta" />
                      <AppointmentItem name="João Costa" time="10:30" date="Amanhã" service="Avaliação" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">Clientes recentes</h3>
                    <div className="bg-gray-50 rounded-md p-4 space-y-3">
                      <ClientItem name="Ana Ferreira" phone="(11) 98765-4321" />
                      <ClientItem name="Pedro Santos" phone="(11) 91234-5678" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-kontrola-50 p-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estatísticas do mês</span>
                  <span className="text-sm font-medium text-kontrola-700">Ver mais</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureProps {
  icon: React.ElementType;
  title: string;
}

const Feature: React.FC<FeatureProps> = ({ icon: Icon, title }) => {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-md p-4 text-center">
      <Icon className="h-6 w-6 text-kontrola-600 mb-2" />
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </div>
  );
};

interface AppointmentItemProps {
  name: string;
  time: string;
  date: string;
  service: string;
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ name, time, date, service }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="bg-kontrola-100 text-kontrola-700 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
        {name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">{service}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-800">{time}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
  );
};

interface ClientItemProps {
  name: string;
  phone: string;
}

const ClientItem: React.FC<ClientItemProps> = ({ name, phone }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="bg-kontrola-100 text-kontrola-700 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{name}</p>
        <p className="text-xs text-gray-500">{phone}</p>
      </div>
    </div>
  );
};

export default HeroSection;
