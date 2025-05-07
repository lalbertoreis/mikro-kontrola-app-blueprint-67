
import { useState } from "react";
import { AppointmentWithDetails, CalendarViewOptions } from "@/types/calendar";
import { addMonths, subMonths, addWeeks, subWeeks, startOfToday } from "date-fns";

export function useCalendarState() {
  const [view, setView] = useState<CalendarViewOptions["view"]>("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>();
  const [hideCanceled, setHideCanceled] = useState<boolean>(false);
  
  // Dialog states
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [blockTimeDialogOpen, setBlockTimeDialogOpen] = useState(false);
  const [actionsDialogOpen, setActionsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [dialogKey, setDialogKey] = useState(0); // Para forçar recriação do diálogo

  const handleSelectAppointment = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setActionsDialogOpen(true);
    // Ensure other dialogs are closed
    setAppointmentDialogOpen(false);
    setBlockTimeDialogOpen(false);
  };

  const handleEditAppointment = () => {
    setEditMode(true);
    // Não fechamos o actions dialog imediatamente - isso será feito através do onActionsDialogOpenChange
  };

  const navigatePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleOpenNewAppointment = () => {
    setEditMode(false);
    setSelectedAppointment(null);
    setDialogKey(prev => prev + 1);
    // Ensure other dialogs are closed
    setActionsDialogOpen(false);
    setBlockTimeDialogOpen(false);
    setAppointmentDialogOpen(true);
  };

  const handleOpenBlockTime = () => {
    setDialogKey(prev => prev + 1);
    // Ensure other dialogs are closed
    setActionsDialogOpen(false);
    setAppointmentDialogOpen(false);
    setBlockTimeDialogOpen(true);
  };

  const toggleHideCanceled = () => {
    setHideCanceled(prev => !prev);
  };

  // Convenience function to reset to today
  const goToToday = () => {
    setCurrentDate(startOfToday());
  };

  // Handle closing dialogs
  const handleCloseAppointmentDialog = () => {
    setAppointmentDialogOpen(false);
    // Se estávamos em modo de edição e fechamos o diálogo de agendamento, 
    // reabrir o diálogo de ações
    if (editMode && selectedAppointment) {
      setActionsDialogOpen(true);
    }
    setEditMode(false);
  };

  const handleCloseBlockTimeDialog = () => {
    setBlockTimeDialogOpen(false);
  };

  const handleActionsDialogOpenChange = (open: boolean) => {
    setActionsDialogOpen(open);
    
    // Se estamos fechando o diálogo de ações e estamos em modo de edição,
    // então devemos abrir o diálogo de edição
    if (!open && editMode) {
      setTimeout(() => {
        setAppointmentDialogOpen(true);
      }, 100);
    }
  };

  return {
    view,
    setView,
    currentDate,
    setCurrentDate,
    selectedEmployee,
    setSelectedEmployee,
    appointmentDialogOpen,
    setAppointmentDialogOpen,
    blockTimeDialogOpen,
    setBlockTimeDialogOpen,
    actionsDialogOpen,
    setActionsDialogOpen,
    selectedAppointment,
    setSelectedAppointment,
    editMode,
    setEditMode,
    dialogKey,
    hideCanceled,
    toggleHideCanceled,
    handleSelectAppointment,
    handleEditAppointment,
    navigatePrevious,
    navigateNext,
    handleOpenNewAppointment,
    handleOpenBlockTime,
    goToToday,
    handleCloseAppointmentDialog,
    handleCloseBlockTimeDialog,
    handleActionsDialogOpenChange,
  };
}
