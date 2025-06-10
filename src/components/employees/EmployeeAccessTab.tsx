
import React, { useState } from "react";
import { toast } from "sonner";
import { useEmployeeInvites } from "@/hooks/useEmployeeInvites";
import NoEmployeeMessage from "./access/NoEmployeeMessage";
import ExistingAccessDisplay from "./access/ExistingAccessDisplay";
import AccessForm from "./access/AccessForm";

interface EmployeeAccessTabProps {
  employeeId?: string;
}

const EmployeeAccessTab: React.FC<EmployeeAccessTabProps> = ({ employeeId }) => {
  const { createInvite, isCreating, getInviteByEmployeeId } = useEmployeeInvites();
  const [accessEnabled, setAccessEnabled] = useState(false);
  
  const existingInvite = employeeId ? getInviteByEmployeeId(employeeId) : null;

  const onSubmit = async (data: { email: string; temporaryPassword: string }) => {
    if (!employeeId) {
      toast.error("É necessário salvar o funcionário primeiro");
      return;
    }

    if (!accessEnabled) {
      toast.error("Habilite o acesso ao painel primeiro");
      return;
    }

    try {
      await createInvite({
        employeeId,
        email: data.email,
        temporaryPassword: data.temporaryPassword,
      });
      
      toast.success("Convite enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar convite:", error);
      toast.error("Erro ao enviar convite. Tente novamente.");
    }
  };

  if (!employeeId) {
    return <NoEmployeeMessage />;
  }

  if (existingInvite && accessEnabled) {
    return (
      <ExistingAccessDisplay
        invite={existingInvite}
        accessEnabled={accessEnabled}
        onAccessEnabledChange={setAccessEnabled}
      />
    );
  }

  return (
    <AccessForm
      accessEnabled={accessEnabled}
      onAccessEnabledChange={setAccessEnabled}
      onSubmit={onSubmit}
      isCreating={isCreating}
    />
  );
};

export default EmployeeAccessTab;
