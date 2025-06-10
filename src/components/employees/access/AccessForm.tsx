
import React from "react";
import { Key, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AccessControlToggle from "./AccessControlToggle";
import InviteForm from "./InviteForm";
import AccessPermissionsInfo from "./AccessPermissionsInfo";

interface AccessFormProps {
  accessEnabled: boolean;
  onAccessEnabledChange: (enabled: boolean) => void;
  onSubmit: (data: { email: string; temporaryPassword: string }) => void;
  isCreating: boolean;
}

const AccessForm: React.FC<AccessFormProps> = ({
  accessEnabled,
  onAccessEnabledChange,
  onSubmit,
  isCreating,
}) => {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Key className="h-4 w-4 sm:h-5 sm:w-5" />
          Dar Acesso ao Painel
        </CardTitle>
        <CardDescription className="text-sm">
          Configure o acesso do funcionário ao painel administrativo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6 pt-0">
        <AccessControlToggle
          accessEnabled={accessEnabled}
          onAccessEnabledChange={onAccessEnabledChange}
        />

        {accessEnabled && (
          <>
            <InviteForm onSubmit={onSubmit} isCreating={isCreating} />
            <div className="bg-amber-50 p-3 sm:p-4 rounded-lg">
              <h4 className="text-sm font-medium text-amber-900 mb-2">O funcionário terá acesso a:</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Agenda (apenas visualização)</li>
                <li>• Seus próprios agendamentos</li>
                <li>• Não poderá criar ou editar agendamentos</li>
                <li>• Não terá acesso a outras áreas do sistema</li>
              </ul>
            </div>
          </>
        )}

        {!accessEnabled && (
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Habilite o acesso ao painel para configurar as credenciais do funcionário
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessForm;
