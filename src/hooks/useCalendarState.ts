import { useState, useCallback } from "react";
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

  const handleSelectAppointment = useCallback((appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setActionsDialogOpen(true);
    setAppointmentDialogOpen(false);
  }, []);

  const handleEditAppointment = useCallback(() => {
    if (selectedAppointment) {
      setEditMode(true);
      setAppointmentDialogOpen(true);
      setActionsDialogOpen(false);
      setDialogKey(prevKey => prevKey + 1);
    }
  }, [selectedAppointment]);

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
    setDialogKey(prev => prev + 1);
    setAppointmentDialogOpen(true);
  };

  const handleOpenBlockTime = () => {
    setDialogKey(prev => prev + 1);
    setBlockTimeDialogOpen(true);
  };

  const toggleHideCanceled = () => {
    setHideCanceled(prev => !prev);
  };

  // Convenience function to reset to today
  const goToToday = () => {
    setCurrentDate(startOfToday());
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
  };
}
