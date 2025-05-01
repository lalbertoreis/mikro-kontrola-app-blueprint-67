
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeFormComponent from "@/components/employees/EmployeeForm";

const EmployeeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const handleSuccess = () => {
    toast({
      title: isEditing ? "Funcionário atualizado" : "Funcionário adicionado",
      description: isEditing 
        ? "As informações do funcionário foram atualizadas com sucesso." 
        : "O funcionário foi adicionado com sucesso.",
    });
    navigate("/dashboard/employees");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Editar Funcionário" : "Adicionar Funcionário"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Atualize as informações do funcionário abaixo." 
              : "Preencha as informações para adicionar um novo funcionário."}
          </p>
        </div>
        
        <EmployeeFormComponent employeeId={id} onSuccess={handleSuccess} />
      </div>
    </DashboardLayout>
  );
};

export default EmployeeForm;
