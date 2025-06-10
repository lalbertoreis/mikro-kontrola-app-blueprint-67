
import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const NoEmployeeMessage: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-base sm:text-lg font-medium">Salve o funcionário primeiro</h3>
            <p className="text-sm text-muted-foreground">
              Para dar acesso ao painel, é necessário salvar as informações do funcionário primeiro.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoEmployeeMessage;
