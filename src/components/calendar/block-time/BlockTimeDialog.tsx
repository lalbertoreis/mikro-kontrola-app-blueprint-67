
import React from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlockTimeForm, BlockTimeFormValues } from "./BlockTimeForm";

interface BlockTimeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedEmployeeId?: string;
}

const BlockTimeDialog: React.FC<BlockTimeDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedEmployeeId,
}) => {
  const { blockTimeSlot, isBlocking } = useAppointments();
  
  // Handle form submission with improved date handling
  const handleSubmit = async (values: BlockTimeFormValues) => {
    try {
      // Format date properly to avoid timezone issues
      const formattedDate = format(values.date, "yyyy-MM-dd");
      
      await blockTimeSlot({
        employeeId: values.employee,
        date: formattedDate,
        startTime: values.startTime,
        endTime: values.endTime,
        reason: values.reason,
      });
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Error blocking time slot:", error);
    }
  };
  
  const defaultValues = {
    date: selectedDate || new Date(),
    employee: selectedEmployeeId || "",
    startTime: "",
    endTime: "",
    reason: "",
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bloquear Horário</DialogTitle>
          <DialogDescription>
            Preencha os dados para bloquear um horário na agenda
          </DialogDescription>
        </DialogHeader>
        
        <BlockTimeForm 
          onSubmit={handleSubmit} 
          onCancel={onClose}
          isBlocking={isBlocking}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BlockTimeDialog;
