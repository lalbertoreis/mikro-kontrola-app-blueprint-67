
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ServiceFormComponent from "@/components/services/ServiceForm";
import { useParams } from "react-router-dom";

const ServiceForm = () => {
  const { id } = useParams();
  const isEditing = id !== undefined;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? "Editar Serviço" : "Novo Serviço"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Atualize as informações do serviço abaixo." 
            : "Preencha as informações para cadastrar um novo serviço."
          }
        </p>
        
        <ServiceFormComponent />
      </div>
    </DashboardLayout>
  );
};

export default ServiceForm;
