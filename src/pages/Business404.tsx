
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Business404: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">Ops! Estabelecimento não encontrado</h1>
        <p className="text-gray-600 mb-8">
          O estabelecimento que você está procurando não existe ou ainda não ativou os agendamentos online.
        </p>
        <Link to="/">
          <Button>Voltar para a página inicial</Button>
        </Link>
      </div>
    </div>
  );
};

export default Business404;
