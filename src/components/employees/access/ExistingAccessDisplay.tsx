
import React from "react";
import { CheckCircle, Shield, Mail, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AccessPermissionsInfo from "./AccessPermissionsInfo";

interface EmployeeInvite {
  email: string;
  is_active: boolean;
}

interface ExistingAccessDisplayProps {
  invite: EmployeeInvite;
  accessEnabled: boolean;
  onAccessEnabledChange: (enabled: boolean) => void;
  onResendInvite?: () => void;
  isResending?: boolean;
  isDisabling?: boolean;
  employeeId: string;
}

const ExistingAccessDisplay: React.FC<ExistingAccessDisplayProps> = ({
  invite,
  accessEnabled,
  onAccessEnabledChange,
  onResendInvite,
  isResending = false,
  isDisabling = false,
  employeeId,
}) => {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          Acesso Configurado
        </CardTitle>
        <CardDescription className="text-sm">
          O funcionário já possui acesso ao painel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
        <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Acesso ao Painel</span>
          </div>
          <Switch 
            checked={accessEnabled} 
            onCheckedChange={onAccessEnabledChange}
            disabled={isDisabling}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm break-all">{invite.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="flex items-center gap-2">
              <Badge variant={invite.is_active ? "default" : "secondary"}>
                {invite.is_active ? "Ativo" : "Pendente"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onResendInvite}
            disabled={isResending}
            className="flex items-center gap-2"
          >
            {isResending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {isResending ? "Reenviando..." : "Reenviar Convite"}
          </Button>
        </div>
        
        <AccessPermissionsInfo />
      </CardContent>
    </Card>
  );
};

export default ExistingAccessDisplay;
