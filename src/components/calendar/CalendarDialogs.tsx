
import React, { useState } from "react";
import { AppointmentWithDetails } from "@/types/calendar";
import AppointmentDialog from "./AppointmentDialog";
import BlockTimeDialog from "./BlockTimeDialog";
import AppointmentActionsDialog from "./AppointmentActionsDialog";

interface SelectedTimeSlot {
  date: Date;
  hour?: number;
}

interface CalendarDialogsProps {
  appointmentDialogOpen: boolean;
  blockTimeDialogOpen: boolean;
  actionsDialogOpen: boolean;
  selectedAppointment: AppointmentWithDetails | null;
  editMode: boolean;
  currentDate: Date;
  selectedEmployeeId?: string;
  selectedTimeSlot?: SelectedTimeSlot | null;
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
  selectedTimeSlot,
  dialogKey,
  onAppointmentDialogClose,
  onBlockTimeDialogClose,
  onActionsDialogOpenChange,
  onEditAppointment,
}) => {
  return (
    <>
      {/* Appointment Dialog - Only show when appointmentDialogOpen is true */}
      {appointmentDialogOpen && (
        <AppointmentDialog 
          key={`appointment-dialog-${dialogKey}`}
          isOpen={appointmentDialogOpen}
          onClose={onAppointmentDialogClose}
          selectedDate={selectedTimeSlot?.date || currentDate}
          selectedEmployeeId={selectedEmployeeId}
          selectedHour={selectedTimeSlot?.hour}
          appointmentId={editMode ? selectedAppointment?.id : undefined}
        />
      )}

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
      />
    </>
  );
};

export default CalendarDialogs;
