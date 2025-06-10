
import React from "react";
import { Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface AccessControlToggleProps {
  accessEnabled: boolean;
  onAccessEnabledChange: (enabled: boolean) => void;
}

const AccessControlToggle: React.FC<AccessControlToggleProps> = ({
  accessEnabled,
  onAccessEnabledChange,
}) => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium block">Habilitar Acesso ao Painel</span>
          <p className="text-xs text-muted-foreground">
            Permite que o funcionário acesse o sistema
          </p>
        </div>
      </div>
      <Switch 
        checked={accessEnabled} 
        onCheckedChange={onAccessEnabledChange}
        className="flex-shrink-0"
      />
    </div>
  );
};

export default AccessControlToggle;
