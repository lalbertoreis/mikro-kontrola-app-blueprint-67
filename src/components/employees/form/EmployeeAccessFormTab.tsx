
import React from "react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import EmployeeAccessTab from "../EmployeeAccessTab";

interface EmployeeAccessFormTabProps {
  employeeId?: string;
  onPrevious: () => void;
  onSubmit: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isEditing: boolean;
}

const EmployeeAccessFormTab: React.FC<EmployeeAccessFormTabProps> = ({
  employeeId,
  onPrevious,
  onSubmit,
  isCreating,
  isUpdating,
  isEditing,
}) => {
  return (
    <TabsContent value="access" className="pt-4 pb-2">
      <div className="space-y-4">
        <EmployeeAccessTab employeeId={employeeId} />
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
          <Button variant="outline" type="button" onClick={onPrevious} className="w-full sm:w-auto">
            Voltar
          </Button>
          <Button 
            type="button" 
            onClick={onSubmit}
            disabled={isCreating || isUpdating}
            className="w-full sm:w-auto"
          >
            {isCreating || isUpdating ? "Salvando..." : (isEditing ? "Atualizar" : "Adicionar")} Funcionário
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};

export default EmployeeAccessFormTab;
