
import React, { useState } from "react";
import { AppointmentWithDetails } from "@/types/calendar";
import AppointmentDialog from "./AppointmentDialog";
import BlockTimeDialog from "./BlockTimeDialog";
import AppointmentActionsDialog from "./AppointmentActionsDialog";

interface CalendarDialogsProps {
  appointmentDialogOpen: boolean;
  blockTimeDialogOpen: boolean;
  actionsDialogOpen: boolean;
  selectedAppointment: AppointmentWithDetails | null;
  editMode: boolean;
  currentDate: Date;
  selectedEmployeeId?: string;
  dialogKey: number;
  onAppointmentDialogClose: () => void;
  onBlockTimeDialogClose: () => void;
  onActionsDialogOpenChange: (open: boolean) => void;
  onEditAppointment: () => void;
}

const CalendarDialogs: React.FC<CalendarDialogsProps> = ({
  appointmentDialogOpen,
  blockTimeDialogOpen,
  actionsDialogOpen,
  selectedAppointment,
  editMode,
  currentDate,
  selectedEmployeeId,
  dialogKey,
  onAppointmentDialogClose,
  onBlockTimeDialogClose,
  onActionsDialogOpenChange,
  onEditAppointment,
}) => {
  // Add these mock handlers to fix the type error
  const handleCancel = () => {
    console.log("Cancel appointment");
    onActionsDialogOpenChange(false);
  };
  
  const handlePayment = () => {
    console.log("Process payment");
    onActionsDialogOpenChange(false);
  };
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  return (
    <>
      {/* Appointment Dialog */}
      <AppointmentDialog 
        key={`appointment-dialog-${dialogKey}`}
        isOpen={appointmentDialogOpen}
        onClose={onAppointmentDialogClose}
        selectedDate={currentDate}
        selectedEmployeeId={selectedEmployeeId}
        appointmentId={editMode ? selectedAppointment?.id : undefined}
      />

      {/* Block Time Dialog */}
      <BlockTimeDialog 
        key={`block-time-dialog-${dialogKey}`}
        isOpen={blockTimeDialogOpen}
        onClose={onBlockTimeDialogClose}
        selectedDate={currentDate}
        selectedEmployeeId={selectedEmployeeId}
      />

      {/* Appointment Actions Dialog */}
      <AppointmentActionsDialog
        open={actionsDialogOpen}
        onOpenChange={onActionsDialogOpenChange}
        appointment={selectedAppointment}
        onEdit={onEditAppointment}
        onCancel={handleCancel}
        onPayment={handlePayment}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default CalendarDialogs;
