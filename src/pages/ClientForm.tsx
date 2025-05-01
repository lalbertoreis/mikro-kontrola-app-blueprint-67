
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ClientFormComponent from "@/components/clients/ClientForm";
import { useParams } from "react-router-dom";

const ClientForm = () => {
  const { id } = useParams();
  const isEditing = id !== undefined;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? "Editar Cliente" : "Novo Cliente"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Atualize as informações do cliente abaixo." 
            : "Preencha as informações para cadastrar um novo cliente."
          }
        </p>
        
        <ClientFormComponent />
      </div>
    </DashboardLayout>
  );
};

export default ClientForm;
