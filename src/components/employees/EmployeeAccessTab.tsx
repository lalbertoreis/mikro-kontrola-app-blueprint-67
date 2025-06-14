
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEmployeeInvites } from "@/hooks/useEmployeeInvites";
import { useEmployeeById } from "@/hooks/useEmployees";
import NoEmployeeMessage from "./access/NoEmployeeMessage";
import ExistingAccessDisplay from "./access/ExistingAccessDisplay";
import AccessForm from "./access/AccessForm";

interface EmployeeAccessTabProps {
  employeeId?: string;
}

const EmployeeAccessTab: React.FC<EmployeeAccessTabProps> = ({ employeeId }) => {
  const { createInvite, isCreating, getInviteByEmployeeId } = useEmployeeInvites();
  const { data: employee } = useEmployeeById(employeeId);
  const [accessEnabled, setAccessEnabled] = useState(false);
  
  const existingInvite = employeeId ? getInviteByEmployeeId(employeeId) : null;

  // Sincronizar o estado com o convite existente
  useEffect(() => {
    if (existingInvite) {
      setAccessEnabled(existingInvite.is_active);
    } else {
      setAccessEnabled(false);
    }
  }, [existingInvite]);

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
    } catch (error) {
      console.error("Erro ao criar convite:", error);
      toast.error("Erro ao enviar convite. Tente novamente.");
    }
  };

  const handleAccessToggle = (enabled: boolean) => {
    setAccessEnabled(enabled);
    
    if (!enabled && existingInvite) {
      // Se desabilitar o acesso, desativar o convite existente
      // Isso será implementado quando necessário
      console.log("Desabilitando acesso para funcionário:", employeeId);
    }
  };

  if (!employeeId) {
    return <NoEmployeeMessage />;
  }

  if (existingInvite && existingInvite.is_active) {
    return (
      <ExistingAccessDisplay
        invite={existingInvite}
        accessEnabled={accessEnabled}
        onAccessEnabledChange={handleAccessToggle}
      />
    );
  }

  return (
    <AccessForm
      accessEnabled={accessEnabled}
      onAccessEnabledChange={handleAccessToggle}
      onSubmit={onSubmit}
      isCreating={isCreating}
      defaultEmail={employee?.email || ""}
    />
  );
};

export default EmployeeAccessTab;
