
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ClientFormComponent from "@/components/clients/ClientForm";
import { useNavigate, useParams } from "react-router-dom";
import { useClientById } from "@/hooks/useClients";

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== undefined;
  const { data: client, isLoading } = useClientById(id);

  const handleSubmitSuccess = () => {
    navigate("/dashboard/clients");
  };

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
          <ClientFormComponent 
            client={client} 
            onSubmitSuccess={handleSubmitSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientForm;
