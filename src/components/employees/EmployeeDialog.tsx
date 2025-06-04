
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmployeeForm from "./EmployeeForm";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: string;
  onEmployeeCreated?: () => void;
}

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({ 
  open, 
  onOpenChange, 
  employeeId,
  onEmployeeCreated 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const handleSuccess = () => {
    console.log('Employee form success - calling onEmployeeCreated and closing dialog');
    // Primeiro notificar que o funcionário foi criado
    onEmployeeCreated?.();
    // Depois fechar o dialog
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employeeId ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
        </DialogHeader>
        <EmployeeForm 
          employeeId={employeeId}
          onSuccess={handleSuccess}
          onSubmittingChange={setIsSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDialog;
