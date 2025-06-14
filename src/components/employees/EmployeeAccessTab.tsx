
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEmployeeInvites } from "@/hooks/useEmployeeInvites";
import NoEmployeeMessage from "./access/NoEmployeeMessage";
import ExistingAccessDisplay from "./access/ExistingAccessDisplay";
import AccessForm from "./access/AccessForm";
import { useEmployeeById } from "@/hooks/useEmployees";

interface EmployeeAccessTabProps {
  employeeId?: string;
}

const EmployeeAccessTab: React.FC<EmployeeAccessTabProps> = ({ employeeId }) => {
  const { createInvite, isCreating, getInviteByEmployeeId } = useEmployeeInvites();
  const { data: employee } = useEmployeeById(employeeId);
  const [accessEnabled, setAccessEnabled] = useState(false);

  useEffect(() => {
    if (employee) {
      setAccessEnabled(!!employee.auth_user_id);
    }
  }, [employee]);

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
      onAccessEnabledChange={async (enabled) => {
        setAccessEnabled(enabled);
        // Se desabilitar, remove auth_user_id no banco
        if (!enabled && employeeId) {
          // Remove o vínculo auth_user_id
          // Extra: Remove convite ativo (não obrigatório, mas evita “fantasmas”)
          const { error } = await import("@/integrations/supabase/client").then(({ supabase }) =>
            supabase.from("employees").update({ auth_user_id: null }).eq("id", employeeId)
          );
          if (!error) toast.success("Acesso removido");
        }
      }}
      onSubmit={onSubmit}
      isCreating={isCreating}
    />
  );
};

export default EmployeeAccessTab;
