
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ClientFormComponent from "@/components/clients/ClientForm";
import { useParams } from "react-router-dom";
import { useClientById } from "@/hooks/useClients";

const ClientForm = () => {
  const { id } = useParams();
  const isEditing = id !== undefined;
  const { data: client, isLoading } = useClientById(id);

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
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Carregando...</p>
          </div>
        ) : (
          <ClientFormComponent client={client} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientForm;
